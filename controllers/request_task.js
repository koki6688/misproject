var eventproxy = require('eventproxy');
var ep = new eventproxy();

var RequestModel = require('../models/request_task');

exports.request = function (req, res) {

    var rmID = req.body.rmID;
    var tID = req.body.tID;
    var date = new Date().toLocaleString();

    //

    RequestModel.addRequest({rmID: rmID, tID: tID, createTime: date}, function (err, result) {
        if (result) {
            res.render('index');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    })

};