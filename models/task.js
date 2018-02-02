var mongoose = require('../db').mongoose;


var taskSchema = new mongoose.Schema({

    pmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
    rmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null},
    category: String,
    title: String,
    reward: Number,
    due_date: String,
    createTime: {type: Date, default: Date.now()},
    requestTime: Date,
    acceptTime: Date,
    doneTime: Date,
    content: String,
    chat: String,
    pRating: Number,
    rRating: Number,
    status: {type: String, default: 'available'},
    limited_level: Number,
    pCheck: {type: Boolean, default: false},
    rCheck: {type: Boolean, default: false}
});

taskSchema.statics.addTask = function (task, callback) {
    this.create(task, callback);
};

taskSchema.statics.removeTask = function (task, callback) {
    this.deleteOne(task, callback);
};

taskSchema.statics.getTasks = function (query, field, path_select, field_select, sort, callback) {

    this.find(query, field).populate(path_select, field_select).sort(sort).exec(callback);
};

taskSchema.statics.getHistory = function (query, field, path_select1, field_select1, path_select2,
                                          field_select2, sort, callback) {

    this.find(query, field).populate(path_select1, field_select1).populate(path_select2,
        field_select2).sort(sort).exec(callback);
};

taskSchema.statics.updateTask = function (query, update, callback) {
    this.update(query, update, callback);
};

taskSchema.statics.Complete = function (tid, callback) {
    this.update(tid, {status:'completed'}, callback);
};

var Task = mongoose.model('task', taskSchema);


module.exports = Task;