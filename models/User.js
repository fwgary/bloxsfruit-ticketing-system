const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  discriminator: String,
  avatar: String,
  isStaff: Boolean,
  isManager: Boolean,
  banned: Boolean,
});

module.exports = mongoose.model('User', UserSchema);
