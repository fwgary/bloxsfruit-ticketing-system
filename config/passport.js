const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
  },
  async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      discordId: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
    };

    try {
      let user = await User.findOne({ discordId: profile.id });
      if (user) {
        user = await User.findOneAndUpdate({ discordId: profile.id }, newUser, { new: true });
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
