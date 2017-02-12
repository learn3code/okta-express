var express = require('express');
var db = require('./database');
var router = express.Router();

router.get('/bank/:id', function (req, res, next) {
  db.getBankInfo(req.params, function (item) {
    res.send(item);
  });
});

router.post('/exam', function (req, res, next) {
  db.createExam(req.body, function () {
    res.sendStatus(201);
  });
});

router.get('/exams', function (req, res, next) {
  db.getExamList(function (item) {
    res.send(item);
  });
});

module.exports = router;
