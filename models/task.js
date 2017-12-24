var mongoose = require('../db').mongoose;

var taskSchema = new mongoose.Schema({

    pmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
    rmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
    category: String,
    title: String,
    reward: String,
    due_date: String,
    due_time: String,
    createTime: {type:Date, default:Date.now()},
    requestTime: String,
    acceptTime: String,
    doneTime: String,
    content: String,
    chat: String,
    tRatings: String,
    status: String,
    limited_level: String

});

taskSchema.statics.addTask = function (task, callback) {
    this.create(task, callback);
};

taskSchema.statics.getTasks = function (query, path_select, sort, callback) {

    this.find(query).populate(path_select).sort(sort).exec(callback);

};

taskSchema.statics.addRequest = function (query, update, callback) {
    this.update(query, update, callback);
};


taskSchema.statics.getTaskDetail = function (tID, callback) {
    this.findOne({_id: tID}, callback);
};

taskSchema.statics.addAccept = function (query, update, callback) {
    this.update(query, update, callback);
};

taskSchema.statics.declineRequest = function (query, update, callback) {
    this.update(query, update, callback);
};

taskSchema.statics.getRequestTask = function (pmID, callback) {
    this.find({pmID: pmID, status: "request"}, callback);
};

var Task = mongoose.model('task', taskSchema);


module.exports = Task;