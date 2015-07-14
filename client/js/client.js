
var messageList = document.getElementById('messages');
var textBox = document.getElementById('message-box');

var socket = io.connect();

socket.on('connect', function() {

	//tell the server to register us as a new player or get our old profile
	socket.emit('join', {token: getCookie("token")});

	socket.on('allocate id', function(msg) {
		console.log("Setting cookie for new user" + msg.uId);
		setCookie('token', msg.uId);
	});

	socket.on('message', function (msg) {

	    var newItem = document.createElement('li');
	    console.log(msg)
	    newItem.textContent = msg.text + " " + msg.id;

	    messageList.appendChild(newItem);

	    messageList.scrollTop = messageList.scrollHeight;
	});

});


var send = function () {
    var text = textBox.value;
    socket.emit('message', {text: text, id: getCookie("token")});
    textBox.value = '';
    console.log(getCookie('token'));
    return false;
};

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (20*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return undefined;
}