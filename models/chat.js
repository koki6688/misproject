var mongoose = require('../db').mongoose;

var chatSchema = mongoose.Schema({
    tid: String,
    rmID: {type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null},
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
});

    chatSchema.statics.getChat = function (query, field, path_select, field_select, callback) {

        this.find(query, field).populate(path_select, field_select).exec(callback);
};

module.exports = mongoose.model('chat', chatSchema);