var eventproxy = require('eventproxy');
var ep = new eventproxy();
var path = require('path');
var fs = require('fs');


var TaskModel = require('../models/task');
var MemberModel = require('../models/members');


exports.showTask = function (req, res) {

    var query = {status: 'available'};
    var sort = {createTime: -1};
    var path_select = 'pmID';
    var field_select = '_id nickname';

    TaskModel.getTasks(query, path_select,field_select , sort, function (err, tasks) {
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
    var status = req.body.status;


//存至DB

    TaskModel.addTask({
        pmID: pmID, title: title, category: category, content: content, reward: reward,
        limited_level: limited_level, due_date: due_date, due_time: due_time,
        status: status
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
    var path_select = 'pmID';
    var field_select = '_id nickname';

    TaskModel.getTaskDetail(tID, path_select,field_select, function (err, task) {
        if (err) {
            console.log('err')
        }

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

exports.decline = function (req, res) {

    var rmID = null;
    var tID = req.body.tID;
    var status = req.body.status;
    var date = null;

    var query = {_id: tID};

    TaskModel.declineRequest(query, {rmID: rmID, status: status, requestTime: date}, function (err, result) {
        if (result) {
            res.render('home');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};

exports.accept_tasks = function (req, res) {

    var path_select = 'rmID';
    var field_select = '_id nickname';

    TaskModel.getRequestTask(req.session.member._id, path_select,field_select,function (err, tasks) {
        res.render('accept-task', {tasks: tasks});
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