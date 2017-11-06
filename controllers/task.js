var eventproxy = require('eventproxy');
var ep = new eventproxy();

var TaskModel = require('../models/task');

exports.showTask = function (req, res) {
    res.render('register');
};

exports.task = function (req, res) {

    //獲取輸入內容

    var title = req.body.title;
    var chat = req.body.chat;
    var category = req.body.category;
    var due_time = new Date().toLocaleString();
    var content = req.body.content;
    var level = req.body.level;


//存至DB

    TaskModel.addTask({
        title: title, category: category, content: content,
        chat: chat, level: level, due_time: due_time
    }, function (err, result) {
        if (err) {
            ep.emit('info_error', 'error')
        } else
            res.render('new-task')
    });

};

