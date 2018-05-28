var express = require('express');
var app = express();
var port = process.env.PORT || '4000';
var misproject = require('../models/chat');
var serverModel = require('../models/chat');
var fs = require('fs');


server = app.listen(4000)


//*CHAT*//

exports.chat = function (req, res) {

    var tid = req.params.tid;
    var query = {_id: tid};
    var field = {};
    var path_select = 'tid';
    var field_select = 'username message';


    serverModel.getChat(query, field, path_select, field_select, function (err, tasks) {

            res.render('chat', {tasks: tasks});
            console.log(tid)

        }
    );
    var io = require("socket.io")(server);

    //listen on every connection
    io.sockets.on('connection', function(socket)  {
            console.log('New user connected');

            socket.on("channelfixer", function (mychannel) {
                console.log(mychannel)
                socket.join(mychannel);
            })

            var query = misproject.find({tid:tid});
            query.sort('-created').limit(5).exec(function(err , docs){
                if(err) throw err;
                console.log('sending old msgs')
                socket.emit("load old msgs", docs);
            });

//default username

            var socketid = socket.id;
            socket.username =  "";

//listen on change_username
            socket.on('change_username', function (data) {
                console.log('lul change')
                socket.username = data.username;
            });

//share images
            socket.on('user image', function (msg) {
                console.log('lul image');
                io.sockets.emit('user image', socket.username + ' send :', msg);
            });



//listen on new_message
            socket.on('new_message', function (data) {
                var newMsg = new misproject({ message:data.message, username: socket.username , tid: tid})
                newMsg.save(function (err) {
                    if (err) throw err;
                })
                //console.log(tid)
                //broadcast the new message
                //io.sockets.emit('new_message', { message: data.message, username: socket.username , tid: tid});
                io.to(socketid).emit('new_message',{ message: data.message, username: socket.username , tid: tid});

            });
            //listen on typing
            socket.on('typing', function (data) {
                socket.to(data).emit('typing', {username: socket.username})
            });
//disconnect
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        });
};












