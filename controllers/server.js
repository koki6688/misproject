var express = require('express');
var app = express();
var misproject = require('../models/chat');
var serverModel = require('../models/chat');
var path = require('path');
var formidable = require('formidable');
var eventproxy = require('eventproxy');
var ep = new eventproxy();
var fs = require('fs');
server = app.listen(4000);
var io = require("socket.io")(server);





app.use(express.static(path.join(__dirname, 'public')));
//*CHAT*//



exports.chat = function (req, res) {

    var tid = req.params.tid;
    var query = {_id: tid};
    var field = {};
    var path_select = 'tid';
    var field_select = 'username message';


    serverModel.getChat(query, field, path_select, field_select, function (err, tasks) {

            res.render('chat', {tasks: tasks});
            console.log(tid);

        }
    );


    //listen on every connection
    io.sockets.on('connection', function(socket)  {
        console.log('New user connected');

        socket.on("channelfixer", function (mychannel) {
            //console.log(mychannel)
            socket.join(mychannel);
            console.log(socket.rooms);
        });



        setInterval(
            function(){
                var query = misproject.find({tid: tid});
                query.sort('-created').limit(5).exec(function (err, docs) {
                    if (err) throw err;
                    console.log('sending old msgs');
                    console.log(docs);
                    socket.emit("load old msgs", docs);
                })

            },10000);
        function querydb() {
            var query = misproject.find({tid: tid});
            query.sort('-created').limit(5).exec(function (err, docs) {
                if (err) throw err;
                console.log('sending old msgs');
                console.log(docs);
                socket.emit("load old msgs", docs);
            })
        }
//default username


        //socket.username =  '';

//listen on change_username
        socket.on('change_username', function (data) {
            socket.username = data.username;
        });

//share images
        socket.on('user image', function (msg) {
            console.log('lul image');
            io.sockets.emit('user image', socket.username + ' send :', msg);
        });



//listen on new_message
        socket.on('new_message', function (data) {
            var newMsg = new misproject({ message:data.message, username: socket.username , tid: tid});
            newMsg.save(function (err) {
                if (err) throw err;
            });
            //console.log(data);
            console.log(data.room);
            console.log(socket.rooms);


            //console.log(tid)
            //broadcast the new message
            io.sockets.emit('new_message', { message: data.message, username: socket.username , tid: tid});
            //io.sockets.in(data.room).emit('new_message',{ message: data.message, username: socket.username , tid: tid});


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
exports.uploads = function (req, res) {

    var tid = req.params.tid;
    var query = {_id: tid};
    console.log(tid);

    var form = new formidable.IncomingForm();
    //文件保存目錄為當前項目下之tmp folder
    form.uploadDir = path.join(process.cwd(), 'public', 'tmp');
    console.log(process.cwd());
    //限制大小為1MB
    form.maxFieldsSize = 1024 * 1024;
    //使用文件的原擴展
    form.keepExtensions = true;
    form.parse(req, function (err, fields, file) {
        var filePath = '';
        /*如果提交文件的form中將上傳文件的input名設置為tmpFile，就從tmpFile中取上傳文件。
          否則取for in循環第一個上傳的文件。*/
        if (file.tmpFile) {
            filePath = file.tmpFile.path;
        }

        else {
            for (var key in file) {
                if (file[key].path && filePath === '') {
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移動的目錄文件夾，不存在時創建目標文件夾
        var targetDir = path.join(process.cwd(), 'public', 'upload');
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));
        //判斷文件類型是否允許上傳
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            ep.emit('error', '此類型文件不允許上傳！');
        } else {
            //以time stamp rename files
            console.log("renamefile");
            var fileName = new Date().getTime() + fileExt;
            var targetFile = path.join(targetDir, fileName);

            //移動文件
            fs.rename(filePath, targetFile, function (err) {
                if (err) {

                    ep.emit('error', '移動失敗！');
                } else {
                    console.log("movefile");

                    var newMsg = new misproject({ message:"upload/"+fileName, tid: tid});
                    newMsg.save(function (err) {
                            if (err) {
                                console.log("err!");
                                throw err;
                            }
                            else{
                                console.log("redirect");
                                res.redirect('/chat/' + tid);
                            }
                        }

                    );


                }
            });
        }
    });
};

