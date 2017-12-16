var eventproxy = require('eventproxy');
var ep = new eventproxy();

var TaskModel = require('../models/task');


exports.showTask = function (req, res) {

    var query = {status: 'available'};
    var option = {sort: '-createTime'};

    TaskModel.getTasks(query, option, function (err, tasks) {
        res.render('all-task', {tasks: tasks});
    });
};

exports.showAddTask = function (req, res) {
    res.render('new-task');
};

exports.task = function (req, res) {

    //獲取輸入內容

    var pmID = req.body.pmID;
    var title = req.body.title;
    var chat = req.body.chat;
    var category = req.body.category;
    var createTime = new Date().toLocaleString();
    var due_date = req.body.due_date;
    var due_time = req.body.due_time;
    var content = req.body.content;
    var limited_level = req.body.limited_level;
    var status = req.body.status;


//存至DB

    TaskModel.addTask({
        pmID: pmID, title: title, category: category, content: content, chat: chat,
        limited_level: limited_level, due_date: due_date, due_time: due_time,
        status: status, createTime: createTime
    }, function (err, result) {
        if (err) {
            ep.emit('info_error', 'error')
        } else
            res.render('home')
    });

};

exports.request = function (req, res) {

    var rmID = req.body.rmID;
    var tID = req.body.tID;
    var status = req.body.status;
    var date = new Date().toLocaleString();

    var query = {_id: tID};

    TaskModel.addRequest(query, {rmID: rmID, status: status, requestTime: date}, function (err, result) {
        if (result) {
            res.render('home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};

exports.detail = function (req, res) {
    var tID = req.params.tid;
    TaskModel.getTaskDetail(tID, function (err, task) {
        res.render('detail', {task: task});
    });
};

exports.accept = function (req, res) {

    var tID = req.body.tID;
    var status = req.body.status;
    var date = new Date().toLocaleString();

    var query = {_id: tID};

    TaskModel.addAccept(query, {status: status, acceptTime: date}, function (err, result) {
        if (result) {

            res.render('home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};