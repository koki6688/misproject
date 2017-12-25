var mongoose = require('../db').mongoose;

var RelationSchema = new mongoose.Schema({
    tID: { type: mongoose.Schema.Types.ObjectId, ref: 'task' },
    pmID:{ type: mongoose.Schema.Types.ObjectId, ref: 'members' },
    rmID:{ type: mongoose.Schema.Types.ObjectId, ref: 'members' },
    createTime: String,
    requestTime: String,
    acceptTime: String,
    doneTime: String,
    chat: String,
    status: String,
    tRatings: String
});

module.exports = mongoose.model('Relation', RelationSchema);