const express = require('express');
const jwt = require('jsonwebtoken');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// User login - returns JWT token
router.post('/login', async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) {
    return res.status(400).json({ message: 'discordId is required' });
  }

  try {
    const user = await User.findOne({ discordId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For simplicity, no password here since original app uses Discord OAuth
    // In real app, consider OAuth token exchange or other secure methods

    const payload = { id: user._id, discordId: user.discordId, isStaff: user.isStaff, isManager: user.isManager };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tickets for logged in user
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  const { platform, category, subject, description } = req.body;
  if (!category || category === 'Select a Category') {
    return res.status(400).json({ message: 'Valid category is required' });
  }
  try {
    const newTicket = new Ticket({
      userId: req.user.id,
      platform,
      category,
      subject,
      description
    });
    const ticket = await newTicket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific ticket by ID
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a ticket (e.g., status, assignedTo)
router.put('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    const { status, assignedTo, subject, description } = req.body;
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (subject) ticket.subject = subject;
    if (description) ticket.description = description;

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
