const eventproxy = require('eventproxy');
const ep = new eventproxy();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const MemberModel = require('../models/member');
const TaskModel = require('../models/task');

exports.signin = function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    const query = {email: email};

    if (!email || !password) {
        res.status(422);
        return res.render('index', {s_error: '您輸入的資料不完整', success: false});
    }
    MemberModel.getMember(query, function (err, member) {
        if (member) {

            if (bcrypt.compareSync(password, member.password)) {
                req.session.member = member;

                res.redirect('home');
            } else {
                res.status(422);
                var send = req.flash('s_error', '帳號或密碼錯誤');
                res.render('index', {s_error: send, success: false});
            }

        } else {
            send = req.flash('s_error', '帳號或密碼錯誤');
            res.status(422);
            res.render('index', {s_error: send, success: false});
        }
    })

};

exports.signout = function (req, res) {
    req.session.destroy();
    res.redirect('/');
};