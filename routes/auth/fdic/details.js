var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('auth/fdic/details', { title: 'LDX File Uploader' });
});

module.exports = router;
