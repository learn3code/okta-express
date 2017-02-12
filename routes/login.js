var express = require('express');
var router = express.Router();
var passport = require('./saml-auth.js');

router.get('/',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function (req, res) {
    res.redirect('/');
  }
);

router.post('/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function (req, res) {
    if (req.session.passport && req.session.passport.user.role === 'FDIC') {
      res.redirect('/auth/fdic/');
    }
    else if (req.session.passport && req.session.passport.user.role === 'BANK') {
      res.redirect('/auth/bank');
    } else {
      res.redirect('/');
    }
  }
);

module.exports = router;
