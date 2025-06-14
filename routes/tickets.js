const router = require('express').Router();
const Ticket = require('../models/Ticket');

router.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  const tickets = await Ticket.find({ userId: req.user.id });
  res.render('dashboard', { user: req.user, tickets });
});

module.exports = router;
