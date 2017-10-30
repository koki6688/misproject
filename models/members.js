var mongoose = require('../db').mongoose;

var MemberSchema = new mongoose.Schema({
    name: String,
    password: String,
    bDate: String,
    cell: String,
    email: String,
    mRatings: String,
    nickname: String,
    major: String,
    level: String,
    createTime: String
});

MemberSchema.statics.getUserBySignupInfo = function (username, email, callback) {
    this.find({$or: [{username: username}, {email: email}]}, callback);
};

MemberSchema.statics.addUser = function (user, callback) {
    this.create(user, callback);
};

MemberSchema.statics.getUser = function (username, pass, callback) {
    this.findOne({username: username, pass: pass}, callback);
};