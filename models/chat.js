var mongoose = require('../db').mongoose;


var chatSchema = mongoose.Schema({
    tid: String,
    pmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
    rmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null},
    image: String,
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
});

    chatSchema.statics.getChat = function (query, field, path_select, field_select, callback) {

        this.find(query, field).populate(path_select, field_select).exec(callback);
};
    chatSchema.statics.upload = function (query, update, callback) {
    this.update(query, update, callback);
};



var misproject = mongoose.model('chats', chatSchema);

module.exports = misproject;