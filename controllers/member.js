var eventproxy = require('eventproxy');
var ep = new eventproxy();
var flash = require('connect-flash');
var formidable = require('formidable');
var fs = require('fs');
var moment = require('moment');
var path = require('path');

var MemberModel = require('../models/member');
var TaskModel = require('../models/task');

var bcrypt = require('bcrypt');
var saltRounds = 10;


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

exports.showMember = function (req, res) {

    var mID = req.params.mid;
    var query = {_id: mID};
    var field = {pRating: 1, rRating: 1};
    var path_select = '';
    var field_select = '';
    var sort = {};


    var count_query1 = {rmID: mID, status: "completed"};
    var count_query2 = {pmID: mID, status: "completed"};
    var update = {};

    TaskModel.getTasks(count_query1, field, path_select, field_select, sort, function (err, suc) {

        var totalrRating = 0;
        var rCount = 0;

        if (suc) {
            for (var i = 0; i < suc.length; i++) {
                totalrRating += suc[i].rRating;
                rCount += 1;
            }

            TaskModel.getTasks(count_query2, field, path_select, field_select, sort, function (err, suc) {

                if (suc) {
                    var totalpRating = 0;
                    var pCount = 0;

                    for (var i = 0; i < suc.length; i++) {
                        totalpRating += suc[i].pRating;
                        pCount += 1;
                    }

                    if (rCount === 0 && pCount !== 0) {
                        update = {user_Ratings: totalpRating / pCount};
                    } else if (rCount !== 0 && pCount === 0) {
                        update = {tasker_Ratings: totalrRating / rCount};
                    } else if (rCount !== 0 && pCount !== 0)  {
                        update = {tasker_Ratings: totalrRating / rCount, user_Ratings: totalpRating / pCount};
                    }


                    MemberModel.updateMember(query, update, function (err, result) {
                        if (result) {
                            console.log(totalpRating, pCount, update);
                            MemberModel.getMember(query, function (err, member) {

                                res.render('member', {member: member});
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.showEdit = function (req, res) {

    var mID = req.params.mid;
    var query = {_id: mID};
    MemberModel.getMember(query, function (err, member) {
        res.render('edit', {member: member});
    });
};

exports.editMember = function (req, res) {

    var mID = req.params.mid;
    var self_intro = req.body.self_intro;
    var major = req.body.major;
    var cell = req.body.cell;

    var query = {_id: mID};
    var update = {self_intro: self_intro, major: major, cell: cell};

    MemberModel.updateMember(query, update, function (err, result) {
        if (result) {
            res.redirect('/member/' + mID);
        }
    });
};

exports.showDeposit = function (req, res) {
    res.render('deposit');
};

exports.deposit = function (req, res) {

    var mID = req.body.mid;
    var asset = req.body.asset;

    var query = {_id: mID};
    var update = {$inc: {asset: asset}};

    MemberModel.updateMember(query, update, function (err, result) {
        if (result) {
            MemberModel.getMember(query, function (err, member) {
                if (member) {
                    req.session.member = member;
                    req.session.save();
                }
            });
            res.redirect('/member/' + mID);
        }
    });
};

exports.upload = function (req, res) {

    var mID = req.params.mid;
    var query = {_id: mID};

    var form = new formidable.IncomingForm();
    //文件保存目錄為當前項目下之tmp folder
    form.uploadDir = path.join(process.cwd(), 'public', 'tmp');
    //限制大小為1MB
    form.maxFieldsSize = 1024 * 1024;
    //使用文件的原擴展
    form.keepExtensions = true;
    form.parse(req, function (err, fields, file) {
        var filePath = '';
        /*如果提交文件的form中將上傳文件的input名設置為tmpFile，就從tmpFile中取上傳文件。
          否則取for in循環第一個上傳的文件。*/
        if (file.tmpFile) {
            filePath = file.tmpFile.path;
        }

        else {
            for (var key in file) {
                if (file[key].path && filePath === '') {
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移動的目錄文件夾，不存在時創建目標文件夾
        var targetDir = path.join(process.cwd(), 'public', 'upload');
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));
        //判斷文件類型是否允許上傳
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            ep.emit('error', '此類型文件不允許上傳！');
        } else {
            //以time stamp rename files
            var fileName = new Date().getTime() + fileExt;
            var targetFile = path.join(targetDir, fileName);

            //移動文件
            fs.rename(filePath, targetFile, function (err) {
                if (err) {

                    ep.emit('error', '移動失敗！');
                } else {
                    MemberModel.updateMember(query, {image: 'upload/' + fileName}, function (err, result) {
                        if (result) {
                            res.redirect('/member/' + mID);
                        }
                    });
                }
            });
        }
    });
};