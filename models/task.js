var mongoose = require('../db').mongoose;

var taskSchema = new mongoose.Schema({

    pmID:String,
    rmID:String,
    category: String,
    title: String,
    due_time: String,
    createTime: String,
    content: String,
    chat: String,
    tRatings: String,
    status: String,
    limited_level: String

});

taskSchema.statics.addTask = function (task, callback) {
    this.create(task, callback);
};

taskSchema.statics.getTasks = function (query, option, callback) {
    this.find(query, {}, option, callback);
};


var Task = mongoose.model('task', taskSchema);


module.exports = Task;