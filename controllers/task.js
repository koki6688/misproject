const eventproxy = require('eventproxy');
const ep = new eventproxy();
const path = require('path');
const fs = require('fs');
const moment = require('moment');


const TaskModel = require('../models/task');
const MemberModel = require('../models/member');
const level = require('../models/member_level').level;
const getLevel = require('../models/member_level').getLevel;


exports.showTask = function (req, res) {

    const query = {status: 'available'};
    const field = {category: 1, title: 1, reward: 1, due_date: 1};
    const sort = {createTime: -1};
    const path_select = 'pmID';
    const field_select = '_id nickname';

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

    const pmID = req.body.pmID;
    const title = req.body.title;
    const reward = req.body.reward;
    const fee = req.body.fee;
    const category = req.body.category;
    const due_date = new Date(req.body.due_date);
    const content = req.body.content;
    const limited_level = req.body.limited_level;

    let cost = parseInt(reward) + parseInt(fee);


    const query = {
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

            const send = req.flash('success', '任務發布成功');
            res.render('home', {t_success: send});
            //res.redirect('/home');
        }
    });
};

exports.delete = function (req, res) {

    const tID = req.params.tid;
    const query = {_id: tID};
    const field = {reward: 1, fee: 1};


    TaskModel.getTasks(query, field, '', '', {}, function (err, result) {

        if (result) {

            const cost = result[0].reward + result[0].fee;

            const update = {$inc: {asset: cost}};

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

    const rmID = req.body.rmID;
    const tID = req.body.tID;
    const status = 'request';
    const date = moment().format();

    const query = {_id: tID};
    const update = {rmID: rmID, status: status, requestTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {
            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.detail = function (req, res) {
    const tID = req.params.tid;
    const query = {_id: tID};
    const field = {status: 1, category: 1, title: 1, reward: 1, due_date: 1, limited_level: 1, content: 1};
    const path_select = 'pmID';
    const field_select = '_id nickname';
    const sort = {createTime: 1};

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, task) {
        if (err) {
            console.log('err')
        }
        res.render('detail', {task: task});
    });
};

exports.accept = function (req, res) {

    const tID = req.body.tID;
    const status = 'progressing';
    const date = moment().format();

    const query = {_id: tID};
    const update = {status: status, acceptTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {

            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.decline = function (req, res) {

    const rmID = null;
    const tID = req.body.tID;
    const status = 'available';
    const date = null;

    const query = {_id: tID};
    const update = {rmID: rmID, status: status, requestTime: date};

    TaskModel.updateTask(query, update, function (err, result) {
        if (result) {
            res.redirect('/history');
        } else {
            ep.emit('info_error', '接收失敗！');
        }
    });
};

exports.check_and_rate = function (req, res) {

    const tID = req.body.tID;

    const query = {_id: tID};
    const update = {};

    if (req.body.checker) {

        const checker = req.body.checker;

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
        const rater = req.body.rater;

        const field = {rCheck: 1, pCheck: 1, pRating: 1, rRating: 1, reward: 1};
        const path_select = '';
        const field_select = '';
        const sort = {};
        let reward = 0;

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

                                                const member_level_and_char = getLevel(count);

                                                const update_member = {
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

    const category = req.body.category;
    const reward = req.body.reward;
    const level = req.body.level;
    const due_date = req.body.due_date;
    const reward_minusFifty = reward - 50;
    const m = moment().format();
    const m_plus_hr = moment(m).add(due_date, 'hours');

    const query = {status: 'available'};


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


    const field = {category: 1, title: 1, reward: 1, due_date: 1};
    const sort = {createTime: -1};
    const path_select = 'pmID';
    const field_select = '_id nickname';

    TaskModel.getTasks(query, field, path_select, field_select, sort, function (err, tasks) {
        if (err) {
            console.log(err, query);
        }
        console.log(query);
        res.render('all-task', {tasks: tasks, filter: query});
    });
};

exports.history = function (req, res) {

    const query = {$or: [{pmID: req.session.member._id}, {rmID: req.session.member._id}]};
    const field = {};
    const path_select1 = 'pmID';
    const field_select1 = '_id nickname';
    const path_select2 = 'rmID';
    const field_select2 = '_id nickname';
    const sort = {requestTime: -1};

    TaskModel.getHistory(query, field, path_select1, field_select1, path_select2, field_select2,
        sort, function (err, tasks) {
            res.render('history', {tasks: tasks});
        });
};
