var mongoose = require('../db').mongoose;

var chatSchema = mongoose.Schema({
    tID: {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
    message: String,
    createTime: {type: Date, default: Date.now}
});


chatSchema.statics.addChat = function (chat, callback) {
    this.create(chat, callback);
};


chatSchema.statics.getChat = function (query, field, path_select, field_select, callback) {
        this.find(query, field).populate(path_select, field_select).exec(callback);
};


module.exports = mongoose.model('chat', chatSchema);