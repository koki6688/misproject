var mongoose = require('../db').mongoose;

var chatSchema = mongoose.Schema({
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
});



module.exports = mongoose.model('chat', chatSchema);