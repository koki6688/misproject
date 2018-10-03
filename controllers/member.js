const eventproxy = require('eventproxy');
const ep = new eventproxy();
const flash = require('connect-flash');
const formidable = require('formidable');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const MemberModel = require('../models/member');
const TaskModel = require('../models/task');

const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.showRegister = function (req, res) {
    res.render('register');
};

exports.register = function (req, res) {

    //獲取輸入內容

    const name = req.body.name;
    const password = req.body.password;
    const recheck = req.body.recheck;
    const bDate = req.body.bDate;
    const cell = req.body.cell;
    const email = req.body.email;
    const nickname = req.body.nickname;
    const major = req.body.major;
    const gender = req.body.gender;


    //檢驗內容

    const hasEmptyInfo = [name, password, recheck, email].some(function (t) {
        return t === '';
    });
    const isPassDiff = password !== recheck;

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
                email: email, nickname: nickname, major: major,gender:gender
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

    const mID = req.params.mid;
    const query = {_id: mID};
    const field = {pRating: 1, rRating: 1};
    const path_select = '';
    const field_select = '';
    const sort = {};


    const count_query1 = {rmID: mID, status: "completed"};
    const count_query2 = {pmID: mID, status: "completed"};
    let update = {};

    TaskModel.getTasks(count_query1, field, path_select, field_select, sort, function (err, suc) {

        let totalrRating = 0;
        let rCount = 0;

        if (suc) {
            for (var i = 0; i < suc.length; i++) {
                totalrRating += suc[i].rRating;
                rCount += 1;
            }

            TaskModel.getTasks(count_query2, field, path_select, field_select, sort, function (err, suc) {

                if (suc) {
                    let totalpRating = 0;
                    let pCount = 0;

                    for (let i = 0; i < suc.length; i++) {
                        totalpRating += suc[i].pRating;
                        pCount += 1;
                    }

                    if (rCount === 0 && pCount !== 0) {
                        update = {user_Ratings: totalpRating / pCount};
                    } else if (rCount !== 0 && pCount === 0) {
                        update = {tasker_Ratings: totalrRating / rCount};
                    } else if (rCount !== 0 && pCount !== 0) {
                        update = {tasker_Ratings: totalrRating / rCount, user_Ratings: totalpRating / pCount};
                    }else{
                        update={tasker_Ratings: 0, user_Ratings: 0};
                    }


                    MemberModel.updateMember(query, update, function (err, result) {
                        if (result) {

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

    const mID = req.params.mid;
    const query = {_id: mID};
    MemberModel.getMember(query, function (err, member) {
        res.render('edit', {member: member});
    });
};

exports.editMember = function (req, res) {

    const mID = req.params.mid;
    const self_intro = req.body.self_intro;
    const major = req.body.major;
    const cell = req.body.cell;

    const query = {_id: mID};
    const update = {self_intro: self_intro, major: major, cell: cell};

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

    const mID = req.body.mid;
    const asset = req.body.asset;

    const query = {_id: mID};
    const update = {$inc: {asset: asset}};

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

    const mID = req.params.mid;
    const query = {_id: mID};

    const form = new formidable.IncomingForm();
    //文件保存目錄為當前項目下之tmp folder
    form.uploadDir = path.join(process.cwd(), 'public', 'tmp');
    //限制大小為1MB
    form.maxFieldsSize = 1024 * 1024;
    //使用文件的原擴展
    form.keepExtensions = true;
    form.parse(req, function (err, fields, file) {
        let filePath = '';
        /*如果提交文件的form中將上傳文件的input名設置為tmpFile，就從tmpFile中取上傳文件。
          否則取for in循環第一個上傳的文件。*/
        if (file.tmpFile) {
            filePath = file.tmpFile.path;
        }

        else {
            for (let key in file) {
                if (file[key].path && filePath === '') {
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移動的目錄文件夾，不存在時創建目標文件夾
        const targetDir = path.join(process.cwd(), 'public', 'upload');
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        console.log(targetDir);
        const fileExt = filePath.substring(filePath.lastIndexOf('.'));
        //判斷文件類型是否允許上傳
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            ep.emit('error', '此類型文件不允許上傳！');
        } else {
            //以time stamp rename files
            const fileName = new Date().getTime() + fileExt;
            const targetFile = path.join(targetDir, fileName);

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