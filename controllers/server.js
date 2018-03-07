var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var serverModel = require('../models/chat');

exports.chat = function (req, res){
    res.render('chat')
};

//set the template engine ejs
app.set('view engine', 'ejs')
app.set('port', process.env.PORT || 8080);


//middlewares
app.use(express.static('public'))


//routes
app.get('', (req, res) => {
    res.render('chat')
})


//Listen on port 5000
server = app.listen(4000)

mongoose.connect('mongodb://localhost/misproject', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('mongoDB Connected...');
    }
});

var chatSchema = mongoose.Schema({
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
});

var misproject = mongoose.model('chats', chatSchema);

var io = require("socket.io")(server);
//listen on every connection
io.on('connection', (socket) => {
    var query = misproject.find({});
    query.sort('-created').limit(5).exec(function(err , docs){
        if(err) throw err;
        socket.emit("load old msgs", docs);
    });
    console.log('New user connected');


    //default username
    socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })



    //listen on new_message
    socket.on('new_message', (data) => {
        var newMsg = new misproject({message: data.message, username: socket.username})
        newMsg.save(function (err) {
            if(err) throw err;

            //broadcast the new message
            io.sockets.emit('new_message', {message: data.message, username: socket.username});
        })

    });
    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username : socket.username})
    })
})