var eventproxy = require('eventproxy');
var ep = new eventproxy();
var path = require('path');
var fs = require('fs');
var moment = require('moment');


var TaskModel = require('../models/task');


exports.showTask = function (req, res) {

    var query = {status: 'available'};
    var field = {category: 1, title: 1, reward: 1, due_date: 1};
    var sort = {createTime: -1};
    var path_select = 'pmID';
    var field_select = '_id nickname';

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, tasks) {
        if (err) {
            console.log('err')
        }
        //console.log(tasks[0].pmID.nickname);
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
    var reward = req.body.reward;
    var category = req.body.category;
    var due_date = req.body.due_date;
    var due_time = req.body.due_time;
    var content = req.body.content;
    var limited_level = req.body.limited_level;


    var query = {
        pmID: pmID, title: title, category: category, content: content, reward: reward,
        limited_level: limited_level, due_date: due_date, due_time: due_time
    };


//存至DB

    TaskModel.addTask(query, function (err, result) {
        if (err) {
            ep.emit('info_error', 'error');

        } else
            var send = req.flash('success', '任務發布成功');
            res.render('home', {t_success: send});
            //res.redirect('/home');
    });

};

exports.delete = function (req, res) {

    var tID = req.params.tid;
    var query = {_id: tID};
    TaskModel.removeTask(query, function (err, result) {
        if (err) {
            ep.emit('info_error', 'error');
        } else
            res.redirect('/home');
    });
    res.redirect('/home')
};

exports.request = function (req, res) {

    var rmID = req.body.rmID;
    var tID = req.body.tID;
    var status = 'request';
    var date = moment().format();

    var query = {_id: tID};

    TaskModel.updateTask(query, {rmID: rmID, status: status, requestTime: date}, function (err, result) {
        if (result) {
            res.redirect('/home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};

exports.detail = function (req, res) {
    var tID = req.params.tid;
    var query = {_id: tID};
    var field = {category: 1, title: 1, reward: 1, due_date: 1, limited_level: 1, content: 1};
    var path_select = 'pmID';
    var field_select = '_id nickname';
    var sort = {createTime: 1};

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, task) {
        if (err) {
            console.log('err')
        }

        res.render('detail', {task: task});
    });
};

exports.accept = function (req, res) {

    var tID = req.body.tID;
    var status = 'progressing';
    var date = moment().format();

    var query = {_id: tID};

    TaskModel.updateTask(query, {status: status, acceptTime: date}, function (err, result) {
        if (result) {

            res.redirect('/home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};

exports.decline = function (req, res) {

    var rmID = null;
    var tID = req.body.tID;
    var status = 'available';
    var date = null;

    var query = {_id: tID};

    TaskModel.updateTask(query, {rmID: rmID, status: status, requestTime: date}, function (err, result) {
        if (result) {
            res.redirect('/home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};

exports.history = function (req, res) {

    var query = {$or: [{pmID: req.session.member._id}, {rmID: req.session.member._id}]};
    var field = {};
    var path_select1 = 'pmID';
    var field_select1 = '_id nickname';
    var path_select2 = 'rmID';
    var field_select2 = '_id nickname';
    var sort = {requestTime: -1};

    TaskModel.getHistory(query, field, path_select1, field_select1, path_select2, field_select2,
        sort, function (err, tasks) {
            console.log(tasks);
            res.render('history', {tasks: tasks});
        });

};

exports.upload = function (req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimietype) {
        var newFilename = String((new Date()).getTime()) + path.extname(filename);
        var filePath = __dirname + '/../public/upload/' + newFilename;
        var url = '/public/upload/' + newFilename;

        file.pipe(fs.createWriteStream(filePath));
        file.on('end', function () {
            res.json({success: true, url: url});
        })
    })
};