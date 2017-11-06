var mongoose = require('../db').mongoose;

var AcceptSchema = new mongoose.Schema({

    amID: String,
    tID: String,
    createTime: String
});

AcceptSchema.statics.addAcceptance = function (acceptance, callback) {
    this.create(acceptance, callback);
};