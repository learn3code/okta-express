var express = require('express');
var config = require('../config.json');
var resumable = require('./resumable-node.js')(config.tempDir);
var tiff2pdf = require('tiff2pdf');
var mime = require('mime');
var db = require('../data/database');
var router = express.Router();

router.get('/', function (req, res, next) {
  resumable.get(req, function (status, filename, original_filename, identifier) {
    if (status === 'found') {
      res.status(200).send(status);
    } else {
      res.send(204);
    }
  });
});

router.post('/', function (req, res, next) {
  resumable.post(req, function (status, filename, original_filename, identifier) {
    res.status(200).send(status);
  });
});

router.delete('/', function (req, res, next) {
  var fs = require('fs');
  var fileName = req.query['fileName'];
  resumable.write(req.query['identifier'], fs.createWriteStream(config.otherDir + fileName), {
    onDone: function () {
      resumable.clean(req.query['identifier'], {
        onDone: function () {
          var mimetype = mime.lookup(config.otherDir + fileName);
          if (mimetype === 'image/tiff') {
            tiff2pdf(config.otherDir + fileName, config.pdfDir, function (result) {
              console.log(result);
              res.sendStatus(200);
            });
          } else if (mimetype === 'application/pdf') {
            fs.createReadStream(config.otherDir + fileName).pipe(fs.createWriteStream(config.pdfDir + fileName));
          } else {
            res.sendStatus(200);
          }

          // document object
          var doc = {
            examId: req.query['examId'],
            fileName: fileName
          }

          db.saveDocuments(doc, function (items) {
            console.log(items);
          });

        }
      });
    }
  });
});

module.exports = router;
