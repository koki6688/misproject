var mongoose = require('../db').mongoose;

var MemberSchema = new mongoose.Schema({
    name: String,
    password: String,
    bDate: String,
    cell: String,
    email: String,
    mRatings: {type:Number, default:0},
    nickname: String,
    major: String,
    level: {type:Number, default:0},
    self_intro: String,
    image: String,
    createTime: {type:Date, default:Date.now()}
});

MemberSchema.statics.getUserBySignupInfo = function (user, email, callback) {
    this.find({$or: [{user: user}, {email: email}]}, callback);
};

MemberSchema.statics.addMember = function (member, callback) {
    this.create(member, callback);
};

MemberSchema.statics.getMemberByEmail = function (email, callback) {
    this.findOne({email: email}).exec(callback);
};

MemberSchema.statics.getMemberByID = function (ID, callback) {
    this.findOne({_id: ID}, callback);
};

MemberSchema.statics.updateMember = function (query, update, callback) {
    this.update(query, update, callback);
};

module.exports = mongoose.model('Member', MemberSchema);