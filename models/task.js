var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var taskSchema = new mongoose.Schema({
    category: String,
    duetime: String,
    content: String,
    chat: String,
    tRatings: String,
    status: String,
    level: String

});

taskSchema.statics.addTask = function (task, callback) {
    this.create(task, callback);
};

taskSchema.statics.getTask = function (task, category, dueTime, callback) {
    this.findOne({name: task, category: category, duetime: dueTime}, callback);
};

var Task = mongoose.model('task', taskSchema);


module.exports = Task;