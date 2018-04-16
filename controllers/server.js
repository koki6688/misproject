var express = require('express');
var app = express();
var mongoose = require('mongoose');

var serverModel = require('../models/chat');
var MemberModel = require('../models/member');
//Listen on port 5000
server = app.listen(4000)
var mongoURI = 'mongodb://localhost/misproject';

mongoose.connect(mongoURI, {
    useMongoClient: true }, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('mongoDB Connected...');
    }
});
var chatSchema = mongoose.Schema({
    tid: String,
    pmID: {type: mongoose.Schema.Types.ObjectId, ref: 'tasks'},
    rmID: {type: mongoose.Schema.Types.ObjectId, ref: 'tasks', default: null},
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
});
var misproject = mongoose.model('chats', chatSchema);


//*CHAT*//

exports.chat = function (req, res){

    var tid = req.params.tid;
    var rmID = req.body.rmID;
    var pmID = req.body.pmID;
    var query = {_id: tid};
    var field = {};
    var path_select = 'tid';
    var field_select = '_id';
    var nickname = req.body.nickname;

    serverModel.getChat(query, field, path_select, field_select, function (err, tasks) {

        res.render('chat', {tasks: tasks})
        console.log(tid);
        console.log(rmID);
        console.log(pmID)
        console.log(nickname)
    }

        );



    var io = require("socket.io")(server);

        //listen on every connection
        io.sockets.on('connection', function(socket)  {
            console.log('New user connected');

            socket.on('disconnect', function() {
                console.log('user disconnected');
        });
                var query = misproject.find({tid: tid });
                query.sort('-created').limit(5).exec(function(err , docs){
                    if(err) throw err;
                    socket.emit("load old msgs", docs);
                });

//default username
            socket.username =  'Anonymous';

//listen on change_username
            socket.on('change_username', function (data) {
                socket.username = data.username;
            });


//listen on new_message
            socket.on('new_message', function (data) {
                var newMsg = new misproject({ message:data.message, username: socket.username , tid: tid})
                newMsg.save(function (err) {
                    if (err) throw err;
                })
                    //broadcast the new message
                    io.sockets.emit('new_message', { message: data.message, username: socket.username , tid: tid});


            });
            //listen on typing
            socket.on('typing', function (data) {
                socket.to(data).emit('typing', {username: socket.username})
            });
        }

        );}





