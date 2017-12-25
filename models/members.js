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
    createTime: {type:Date, default:Date.now()}
});

MemberSchema.statics.getUserBySignupInfo = function (user, email, callback) {
    this.find({$or: [{user: user}, {email: email}]}, callback);
};

MemberSchema.statics.addMember = function (member, callback) {
    this.create(member, callback);
};

MemberSchema.statics.getMemberByEmail = function (email, callback) {
    this.findOne({email: email}, callback);
};

MemberSchema.statics.getMemberByID = function (ID, callback) {
    this.findOne({_id: ID}, callback);
};


module.exports = mongoose.model('Member', MemberSchema);