var eventproxy = require('eventproxy');
var ep = new eventproxy();

var TaskModel = require('../models/task');

exports.showTask = function (req, res) {
    res.render('register');
};

exports.task = function (req, res) {

    //獲取輸入內容

