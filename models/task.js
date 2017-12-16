var mongoose = require('../db').mongoose;

var taskSchema = new mongoose.Schema({

    pmID: String,
    rmID: String,
    category: String,
    title: String,
    due_time: String,
    createTime: String,
    requestTime: String,
    acceptTime: String,
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

taskSchema.statics.addRequest = function (query, update, callback) {
    this.update(query, update, callback);
};

taskSchema.statics.getTaskDetail = function (tID, callback) {
    this.findOne({_id: tID}, callback);
};

var Task = mongoose.model('task', taskSchema);


module.exports = Task;