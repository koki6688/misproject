var eventproxy = require('eventproxy');
var ep = new eventproxy();


    Task = require('../models/task.js'); //記得要載入Model

//get products from db
var tasks = {};
Task.find(function(err, goods) {
    if (err) {
        console.error(err);
    }
    else {
        tasks = goods;
    }
});

//render page
exports.showTasks = function (req, res) {
    res.render('all-task');
    tasks: tasks
};


module.exports = Detail;
