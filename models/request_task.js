var mongoose = require('../db').mongoose;

var RequestSchema = new mongoose.Schema({

    amID: String,
    tID: String,
    createTime: String
});

RequestSchema.statics.addRequest = function (request, callback) {
    this.create(request, callback);
};