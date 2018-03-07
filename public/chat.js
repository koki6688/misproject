$(function(){
    //make connection
    var socket = io.connect('http://localhost:4000')

    //buttons and inputs
    var message = $("#message")
    var username = $("#username")
    var send_message = $("#send_message")
    var send_username = $("#send_username")
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")

    //Emit message
    send_message.click(function(){
        socket.emit('new_message', {message : message.val()})
    })

    socket.on('load old msgs', function(docs){
        for(var i = docs.length-1 ; i >= 0 ; i--){
            displayMsg(docs[i]);
        }
    })

    //Listen on new_message
    socket.on("new_message", function(data) {
        feedback.html('');
        message.val('');
        displayMsg(data);
    });

    function displayMsg(data){
        chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
    }


    //Emit a username
    send_username.click(function(){
        socket.emit('change_username', {username : username.val()})
    })

    //Emit typing
    message.bind("keypress", () => {
        socket.emit('typing')
    })

    //Listen on typing
    socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
    })
});

