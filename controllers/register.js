var eventproxy = require('eventproxy');
var ep = new eventproxy();
var flash = require('connect-flash');

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


    //檢驗內容

    var hasEmptyInfo = [name, password, recheck, email].some(function (t) {
        return t === '';
    });
    var isPassDiff = password !== recheck;

    ep.on('info_error', function (msg) {
        res.status(422);
        //res.render('index', {error: msg, success: false});
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
            var send = req.flash('error', '用戶名或信箱已被占用');
            res.render('register', {r_error: send});

            ep.emit('info_error', '用戶名或信箱已被占用');
            return;
        }

        bcrypt.hash(password, saltRounds, function (err, hash) {
            MemberModel.addMember({
                name: name, password: hash, bDate: bDate, cell: cell,
                email: email, nickname: nickname, major: major
            }, function (err, result) {
                if (result) {
                    var send = req.flash('success', 'success register');
                    res.render('register', {r_success: send});
                } else {
                    send = req.flash('error', '用戶名或信箱已被占用');
                    res.render('register', {r_error: send});
                    ep.emit('info_error', '註冊失敗！');
                }
            })
        });

    });

};

exports.showmember = function (req, res) {

    var mID = req.params.mid;
    MemberModel.getMemberByID(mID, function (err, member) {
        res.render('member', {member: member});
    });
};

exports.showEdit = function (req, res) {

    var mID = req.params.mid;
    MemberModel.getMemberByID(mID, function (err, member) {
        res.render('edit', {member: member});
    });
};

exports.editMember = function (req, res) {

    var mID = req.params.mid;
    var image = req.body.image;
    var self_intro = req.body.self_intro;
    var major = req.body.major;
    var cell = req.body.cell;

    var query = {_id: mID};

    MemberModel.updateMember(query, {
        image: image, self_intro: self_intro, major: major, cell: cell
    }, function (err, result) {
        if (result) {
            res.redirect('/member/'+mID);
        }
    });
};