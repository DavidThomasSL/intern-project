var messageList = document.getElementById('messages');
var textBox = document.getElementById('message-box');

var socket = io.connect();
var user = {};

socket.on('connect', function() {

	//tell the server to register us as a new player or get our old profile
	socket.emit('join', {
		token: getCookie("token")
	});

	socket.on('user details', function(msg) {
		console.log("Setting cookie for new user" + msg.user.uId);
		user.uId = msg.user.uId;
		console.log(msg.user);
		setCookie('token', msg.user.uId);
		setCookie('name', msg.user.name);

	});
});

function submitName() {
	var name = document.getElementById('name-input-box').value;
	document.getElementById('name-input-box').value = "";

	socket.emit('set name', {uId: user.uId, name: name});

}

function setCookie(cname, cvalue) {
	var d = new Date();
	d.setTime(d.getTime() + (20 * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return undefined;
}