var passport = require('passport');
var conf = require('./config.json');
var SamlStrategy = require('passport-saml').Strategy;

var users = [];

passport.use(new SamlStrategy(conf.saml,
  function (profile, done) {
    if (!profile.nameID) {
      return done(new Error("No email found"), null);
    }

    process.nextTick(function () {
      return done(null, profile);
    });
  })
);

passport.serializeUser(function (profile, done) {
  var user = {
    id: profile.nameID,
    role: profile.Role
  };
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

function isUserInSession(profile) {
  if (users && users[profile.nameID]) {
    delete users[profile.nameID];
  }
  users[profile.nameID] = profile;
}

function isRole(id, role) {
  var userRole = users[id].Role;
  return role === userRole ? true : false;
}

exports = module.exports = passport;