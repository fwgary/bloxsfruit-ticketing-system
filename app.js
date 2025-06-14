const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { WebhookClient, EmbedBuilder } = require('discord.js')
const webhookClient = new WebhookClient({ url: "https://discord.com/api/webhooks/1382176955796951132/0pz0u8Vsxniby87ZdIiRp3oOKThV20xIRLPllD2-ez-K97AdGilr59ybo2ja9daQL1Id" });

dotenv.config();

const cors = require('cors');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const apiRoutes = require('./routes/api');

const app = express();

mongoose.connect(process.env.MONGO_URI, {

});

const User = require('./models/User');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/dashboard', ticketRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

const Ticket = require('./models/Ticket');

app.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
  }), (req, res) => {
    res.redirect('/dashboard');
  });
  
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  const tickets = await Ticket.find({ userId: req.user.id });

  res.render('dashboard', { user: req.user, tickets });
});

app.get('/new-ticket', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('new-ticket');
});


app.post('/submit-ticket', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  const { platform, category, subject, description } = req.body;
  const userId = req.user.id
  // Validate form inputs
  if (category === "Select a Category") {
    return res.redirect('/new-ticket');
  }

  try {
    // Create a new ticket
    const newTicket = new Ticket({
      userId,
      platform,
      category,
      subject,
      description
    });

    // Save the ticket to the database
    const tick = await newTicket.save();
     webhookClient.send({
       content: `<@${req.user.discordId}>`,
       embeds: [
        new EmbedBuilder()
        .setTitle('Ticket Created')
        .setDescription(`Your ticket has been created!`)
        .setColor('Green')
        .setURL(`${process.env.ticket_web}/ticket/${tick._id}`)
       ]
     })
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/staff-ticket/:ticketid', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  if(req.isAuthenticated()){
    if(req.user.isStaff !== true) return res.redirect('/dashboard')
  }
  try {

    const ticket = await Ticket.findById(req.params.ticketid).populate('userId').populate('assignedTo').populate('messages.user');
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }

    const staffMembers = await User.find({ isStaff: true });
    res.render('staff-ticket-detail', { ticket, staffMembers, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/update-ticket/:ticketid', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  const { status, assignedTo } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }

    ticket.status = status;
    ticket.assignedTo = assignedTo ? assignedTo : null;
    const user = await User.find({ _id: ticket.userId })
    if(req.body.assignedTo !== ""){
      if(ticket.status == "Closed"){
        webhookClient.send({
          content: `<@${user[0].discordId}>`,
          embeds: [
           new EmbedBuilder()
           .setTitle('Ticket Closed')
           .setDescription(`Your ticket has been closed!`)
           .setColor('Green')
          ]
        })
      }
      if(ticket.status !== "Closed"){

      
      const assigned = await User.find({ _id: assignedTo })
      webhookClient.send({
        content: `<@${assigned[0].discordId}>`,
        embeds: [
         new EmbedBuilder()
         .setTitle('Ticket Assigned')
         .setDescription(`A ticket has been assigned to you or the ticket status has been updated!`)
         .setColor('Green')
         .setURL(`${process.env.ticket_web}/ticket/${ticket._id}`)
        ]
      })
    }
    }
     await ticket.save();
   
  

    res.redirect(`/staff-ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Staff Dashboard Route
app.get('/staff-dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  if(req.isAuthenticated()){
    if(req.user.isStaff !== true) return res.redirect('/dashboard')
  }
  try {
    const user = await User.findById(req.user._id);

    const tickets = await Ticket.find().populate('userId').populate('assignedTo');
    res.render('staff-dashboard', { user: req.user, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


app.post('/staff-ticket/:ticketid/respond', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  const { message } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }
    const ticketUser = await User.find({ _id: ticket.userId })
    ticket.messages.push({
      user: req.user._id,
      message: message,
      dateTime: new Date()
    });
    await ticket.save();
    webhookClient.send({
      content: `<@${ticketUser[0].discordId}>`,
      embeds: [
       new EmbedBuilder()
       .setTitle('Ticket Update')
       .setDescription(`A new message is available in your ticket!`)
       .setColor('Green')
       .setURL(`${process.env.ticket_web}/ticket/${ticket._id}`)
      ]
    })
    res.redirect(`/staff-ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ----------------------------------------------
app.get('/ticket/:ticketid', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  try {
    const ticket = await Ticket.findById(req.params.ticketid).populate('userId').populate('messages.user');
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }
    if(ticket.userId.discordId !== req.user.discordId) return res.redirect('/dashboard')
    res.render('ticket', { ticket, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/ticket/:ticketid/respond', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  const { message } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }

    ticket.messages.push({
      user: req.user._id,
      message: message,
      dateTime: new Date()
    });
if(ticket.assignedTo){
  const assigned = await User.find({ _id: ticket.assignedTo })
  webhookClient.send({
    content: `<@${assigned[0].discordId}>`,
    embeds: [
     new EmbedBuilder()
     .setTitle('Ticket Update')
     .setDescription(`A new message is available in the ticket you are assigned!`)
     .setColor('Green')
     .setURL(`${process.env.ticket_web}/ticket/${ticket._id}`)
    ]
  })
}
    
  

    await ticket.save();
    res.redirect(`/ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/user-management', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.isManager) {
    return res.redirect('/dashboard');
  }

  const users = await User.find();
  res.render('user-management', { users });
});

app.post('/update-users', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.isManager) {
    return res.redirect('/dashboard');
  }

  try {
    const users = await User.find();
    for (const user of users) {
      user.isStaff = req.body[`isStaff_${user._id}`] === 'on';
      user.isManager = req.body[`isManager_${user._id}`] === 'on';
      user.banned = req.body[`banned_${user._id}`] === 'on';
      await user.save();
    }
    res.redirect('/user-management');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


const PORT = 8083;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
