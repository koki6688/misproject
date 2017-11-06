var eventproxy = require('eventproxy');
var ep = new eventproxy();

var PostModel = require('../models/post_task');

exports.post = function (req, res) {

    var pmID = req.body.pmID;
    var tID = req.body.tID;
    var date = new Date().toLocaleString();

    //

    PostModel.addPost({pmID: pmID, tID: tID, createTime: date}, function (err, result) {
        if (result) {
            res.render('index');
        } else {
            ep.emit('info_error', '任務創建失敗！');
        }
    })

};