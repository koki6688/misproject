var mongoose = require('../db').mongoose;

var MemberSchema = new mongoose.Schema({
    name: String,
    password: String,
    bDate: String,
    gender: String,
    cell: String,
    email: String,
    asset: {type: Number, default: 0},
    tasker_Ratings: {type: Number, default: 0},
    user_Ratings: {type: Number, default: 0},
    nickname: String,
    major: String,
    level: {type: Number, default: 0},
    char: {type: String, default: "初心者"},
    self_intro: String,
    image: String,
    createTime: {type: Date, default: Date.now()}
});

MemberSchema.statics.getUserBySignupInfo = function (user, email, callback) {
    this.find({$or: [{user: user}, {email: email}]}, callback);
};

MemberSchema.statics.addMember = function (member, callback) {
    this.create(member, callback);
};

MemberSchema.statics.getMember = function (query, callback) {
    this.findOne(query).exec(callback);
};

MemberSchema.statics.updateMember = function (query, update, callback) {
    this.update(query, update, callback);
};

module.exports = mongoose.model('Member', MemberSchema);