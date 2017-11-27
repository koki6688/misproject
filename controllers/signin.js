var eventproxy = require('eventproxy');
var ep = new eventproxy();

var MemberModel = require('../models/members');

exports.signin = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        res.status(422);
        return res.render('index', {error: '您輸入的資料不完整', success: false});
    }
    MemberModel.getMember(email, password, function (err, email) {
        if (email) {
            req.session.email = email;
            res.redirect('new-task');
        } else {
            res.status(422);
            res.render('index', {error: '用戶名或密碼錯誤', success: false});
        }
    })

};