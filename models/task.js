const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new mongoose.Schema({
    category: String,
    duetime: String,
    content: String,
    tRatings: String,
    status: Boolean,
    level: String

});




const Task = mongoose.model('task', taskSchema);

module.exports = Task;