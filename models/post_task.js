var mongoose = require('../db').mongoose;

var PostSchema = new mongoose.Schema({

    pmID: String,
    tID: String,
    createTime: String
});

PostSchema.statics.addPost = function (post, callback) {
    this.create(post, callback);
};