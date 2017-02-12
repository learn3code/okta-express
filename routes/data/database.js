var Engine = require('tingodb')();

function getBankInfo(id, callback) {
  var db = new Engine.Db('data', {});
  var exam = db.collection('exam');
  return exam.find({ certNumber: id.id }).toArray(function (err, item) {
    db.close();
    callback(item);
  });
}

function saveDocuments(doc, callback) {
  var db = new Engine.Db('data', {});
  var documents = db.collection('documents');
  return documents.find(doc).toArray(function (err, items) {
    if (items.length === 0) {
      documents.insert([doc], function (er, rs) {
      });
    }
    db.close();
    callback(items);
  });
}

function getExamList(callback) {
  var db = new Engine.Db('data', {});
  var exam = db.collection('exam');
  return exam.find({}).toArray(function (err, items) {
    db.close();
    callback(items);
  });
}

function createExam(data, callback) {
  var db = new Engine.Db('data', {});
  var exam = db.collection('exam');
  return exam.insert([data], function (er, rs) {
    db.close();
    callback();
  });
}

function getDocList(examId, callback) {
  var db = new Engine.Db('data', {});
  var documents = db.collection('documents');
  return documents.find({ examId: examId }).toArray(function (err, items) {
    db.close();
    callback(items);
  });
}

module.exports = {
  getBankInfo: getBankInfo,
  saveDocuments: saveDocuments,
  getDocList: getDocList,
  createExam: createExam,
  getExamList: getExamList
}