var eventproxy = require('eventproxy');
var ep = new eventproxy();
var path = require('path');
var fs = require('fs');
var moment = require('moment');


var TaskModel = require('../models/task');
var MemberModel = require('../models/member');
var level = require('../models/member_level').level;
var getLevel = require('../models/member_level').getLevel;


exports.showTask = function (req, res) {

    var query = {status: 'available'};
    var field = {category: 1, title: 1, reward: 1, due_date: 1};
    var sort = {createTime: -1};
    var path_select = 'pmID';
    var field_select = '_id nickname';

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, tasks) {
        if (err) {
            console.log('err')
        }
        //console.log(tasks[0].pmID.nickname);
        res.render('all-task', {tasks: tasks, filter: null});
    });
};

exports.showAddTask = function (req, res) {
    res.render('new-task');
};

exports.task = function (req, res) {

    //獲取輸入內容

    var pmID = req.body.pmID;
    var title = req.body.title;
    var reward = req.body.reward;
    var fee = req.body.fee;
    var category = req.body.category;
    var due_date = new Date(req.body.due_date);
    var content = req.body.content;
    var limited_level = req.body.limited_level;

    var cost = parseInt(reward) + parseInt(fee);


    var query = {
        pmID: pmID, title: title, category: category, content: content, reward: reward,
        fee: fee, limited_level: limited_level, due_date: due_date
    };


//存至DB

    TaskModel.addTask(query, function (err, result) {
        if (err) {
            ep.emit('info_error', 'error');

        } else {
            console.log(-cost, reward);
            MemberModel.updateMember({_id: pmID}, {$inc: {asset: -cost}}, function (err, result) {
                if (result) {
                    MemberModel.getMember({_id: pmID}, function (err, member) {
                        if (member) {
                            req.session.member = member;
                            req.session.save();
                        }
                    });
                    ep.emit('charge', '扣款成功！任務金額之資產暫時凍結！');
                }
            });

            var send = req.flash('success', '任務發布成功');
            res.render('home', {t_success: send});
            //res.redirect('/home');
        }
    });
};

exports.delete = function (req, res) {

    var tID = req.params.tid;
    var query = {_id: tID};
    var field = {reward: 1, fee: 1};


    TaskModel.getTasks(query, field, '', '', {}, function (err, result) {

        if (result) {

            var cost = result[0].reward + result[0].fee;

            var update = {$inc: {asset: cost}};

            MemberModel.updateMember({_id: req.session.member._id}, update, function (err, result) {

                if (result) {

                    TaskModel.removeTask(query, function (err, result) {
                        if (result) {
                            ep.emit('success', '刪除任務成功！');
                        } else {
                            ep.emit('info_error', 'error');
                        }
                    });

                    MemberModel.getMember({_id: req.session.member._id}, function (err, member) {
                        if (member) {
                            req.session.member = member;
                            req.session.save();
                            res.redirect('/history');
                        }
                    });

                    ep.emit('charge', '扣款成功！任務金額之資產暫時凍結！');
                }
            });
        } else {
            ep.emit('info_error', 'error');
        }
    });
};

exports.request = function (req, res) {

    var rmID = req.body.rmID;
    var tID = req.body.tID;
    var status = 'request';
    var date = moment().format();

    var query = {_id: tID};
    var update = {rmID: rmID, status: status, requestTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {
            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.detail = function (req, res) {
    var tID = req.params.tid;
    var query = {_id: tID};
    var field = {status: 1, category: 1, title: 1, reward: 1, due_date: 1, limited_level: 1, content: 1};
    var path_select = 'pmID';
    var field_select = '_id nickname';
    var sort = {createTime: 1};

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, task) {
        if (err) {
            console.log('err')
        }
        res.render('detail', {task: task});
    });
};

exports.accept = function (req, res) {

    var tID = req.body.tID;
    var status = 'progressing';
    var date = moment().format();

    var query = {_id: tID};
    var update = {status: status, acceptTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {

            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.decline = function (req, res) {

    var rmID = null;
    var tID = req.body.tID;
    var status = 'available';
    var date = null;

    var query = {_id: tID};
    var update = {rmID: rmID, status: status, requestTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {
            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.check_and_rate = function (req, res) {

    var tID = req.body.tID;

    var query = {_id: tID};
    var update = {};

    if (req.body.checker) {

        var checker = req.body.checker;

        update[checker] = true;

        //更新確認狀態

        TaskModel.updateTask(query, update, function (err, result) {
            if (result) {
                ep.emit('update_ok', '上傳成功！');
                if (!req.body.rater) {
                    res.redirect('/history');
                }
            } else {
                ep.emit('info_error', '接收失敗！');
            }
        });
    }

    if (req.body.rater) {
        var rater = req.body.rater;

        var field = {rCheck: 1, pCheck: 1, pRating: 1, rRating: 1, reward: 1};
        var path_select = '';
        var field_select = '';
        var sort = {};
        var reward = 0;

        update[rater] = req.body.rate;

        TaskModel.updateTask(query, update, function (err, result) {
            if (result) {

                ep.emit('success', '評分成功！');

                //兩方皆確認則任務完成
                TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, result) {
                    if (result) {

                        if (result[0].pCheck === true && result[0].rCheck === true && result[0].pRating !== 0 && result[0].rRating !== 0) {

                            reward = result[0].reward;

                            TaskModel.Complete(query, function (err, complete) {
                                if (complete) {

                                    //計算任務完成數以升級

                                    TaskModel.count({
                                            rmID: req.session.member._id,
                                            status: "completed"
                                        }, function (err, count) {
                                            if (count) {

                                                var member_level_and_char = getLevel(count);

                                                var update_member = {
                                                    level: member_level_and_char[0],
                                                    char: member_level_and_char[1],
                                                    $inc: {asset: reward}
                                                };

                                                MemberModel.updateMember({_id: req.session.member._id}, update_member, function (err, suc) {
                                                    if (suc) {
                                                        MemberModel.getMember({_id: req.session.member._id}, function (err, member) {
                                                            if (member) {
                                                                req.session.member = member;
                                                                req.session.save();
                                                            }
                                                        });
                                                        ep.emit('success', '成功！');
                                                    } else {
                                                        console.log(err);
                                                        ep.emit('info_error', '更新會員失敗！');
                                                    }
                                                });
                                            } else {
                                                ep.emit('info_error', '計算完成數量失敗！');
                                            }
                                        }
                                    );
                                    ep.emit('completed!', '任務完成！');
                                } else {
                                    ep.emit('info_error', '任務完成提交失敗！');
                                }
                            });
                        }
                        res.redirect('/history');
                    } else {
                        ep.emit('info_error', '接收失敗！');
                    }
                });
            } else {
                ep.emit('info_error', '接收失敗！');
            }
        });
    }

};

exports.filter = function (req, res) {

    var category = req.body.category;
    var reward = req.body.reward;
    var level = req.body.level;
    var due_date = req.body.due_date;
    var reward_minusFifty = reward - 50;
    var m = moment().format();
    var m_plus_hr = moment(m).add(due_date, 'hours');

    var query = {status: 'available'};


    if (category) {
        query.category = category;
    }
    if (reward) {
        query.reward = {$lt: reward, $gte: reward_minusFifty};
    }
    if (level) {
        query.limited_level = {$lte: level};
    }
    if (due_date) {
        query.due_date = {$lte: m_plus_hr, $gt: m};
    }


    var field = {category: 1, title: 1, reward: 1, due_date: 1};
    var sort = {createTime: -1};
    var path_select = 'pmID';
    var field_select = '_id nickname';

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, tasks) {
        if (err) {
            console.log(err, query);
        }
        console.log(query);
        res.render('all-task', {tasks: tasks, filter: query});
    });
};

exports.history = function (req, res) {

    var query = {$or: [{pmID: req.session.member._id}, {rmID: req.session.member._id}]};
    var field = {};
    var path_select1 = 'pmID';
    var field_select1 = '_id nickname';
    var path_select2 = 'rmID';
    var field_select2 = '_id nickname';
    var sort = {requestTime: -1};

    TaskModel.getHistory(query, field, path_select1, field_select1, path_select2, field_select2,
        sort, function (err, tasks) {
            res.render('history', {tasks: tasks});
        });
};
