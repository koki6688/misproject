var eventproxy = require('eventproxy');
var ep = new eventproxy();

var AcceptModel = require('../models/accept_task');

exports.accept = function (req, res) {

    var amID = req.body.amID;
    var tID = req.body.tID;
    var date = new Date().toLocaleString();

    //

    AcceptModel.addAcceptance({amID: amID, tID: tID, createTime: date}, function (err, result) {
        if (result) {
            res.render('index');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};