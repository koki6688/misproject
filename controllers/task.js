var TaskModel = require('../models/task');

exports.showTask = function (req, res) {
    res.render('register');
};

exports.task = function (req, res) {

    //獲取輸入內容

    var category = req.body.category;
    var duetime = new Date().toLocaleString();
    var content = req.body.content;
    var level = req.body.level;
};


//存至DB



TaskModel.addTask({
    name: name, category: category, content: content,
    chat: chat, level: level
}, function (err, result) {
    if (err) {
        ep.emit('info_error', '')
    }else
        res.render('')
})
)