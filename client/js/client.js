
var messageList = document.getElementById('messages');
var textBox = document.getElementById('message-box');

var socket = io.connect();

socket.on('message', function (msg) {
    var newItem = document.createElement('li');
    newItem.textContent = msg;
    
    messageList.appendChild(newItem);
    
    messageList.scrollTop = messageList.scrollHeight;
});

var send = function () {
    var text = textBox.value;
    socket.emit('message', text);
    textBox.value = '';
    
    return false;
};
