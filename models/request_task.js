var mongoose = require('../db').mongoose;

var RequestSchema = new mongoose.Schema({

    rmID: String,
    tID: String,
    createTime: String
});

RequestSchema.statics.addRequest = function (request, callback) {
    this.create(request, callback);
};