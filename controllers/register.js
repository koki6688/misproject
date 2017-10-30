var eventproxy = require('eventproxy');
var ep = new eventproxy();

var MemberModel = require('../models/members');

var bcrypt = require('bcrypt');
const saltRounds = 10;


exports.showRegister = function (req, res) {
    res.render('register');
};

exports.register = function (req, res) {

    //獲取輸入內容

    var name = req.body.name;
    var password = req.body.password;
    var recheck = req.body.recheck;
    var bDate = req.body.bDate;
    var cell = req.body.cell;
    var email = req.body.email;
    var nickname = req.body.nickname;
    var major = req.body.major;
    var date = new Date().toLocaleString();

    //檢驗內容

    var hasEmptyInfo = [name, password, recheck, email].some(function (t) {
        return t === '';
    });
    var isPassDiff = password !== recheck;

    ep.on('info_error', function () {
        res.status(422);
        res.render('/register');
    });

    if (hasEmptyInfo || isPassDiff) {
        ep.emit('info_error', '註冊訊息錯誤');
        return;
    }

    //存至DB

    MemberModel.getUserBySignupInfo(name, email, function (err, users) {
        if (err) {
            ep.emit('info_error', '用戶資料接收失敗！');
            return;
        }
        if (users.length > 0) {
            ep.emit('info_error', '用戶名或信箱已被占用');
            return;
        }

        bcrypt.hash(password, saltRounds, function(err, hash) {
            MemberModel.addUser({name: name, password: hash, bDate:bDate, cell:cell,
                email: email, nickname:nickname, major:major, createTime:date}, function (err, result) {
                if (result) {
                    res.render('index');
                } else {
                    ep.emit('info_error', '註冊失敗！');
                }
            })
        });

    });

};

