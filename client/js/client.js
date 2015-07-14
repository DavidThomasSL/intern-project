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

	socket.on('room created', function(msg) {
		console.log(msg.roomId);
	});

	socket.on('room joined', function(msg) {
		alert("successfully joined room " + msg.roomId);
	});

	socket.on('failed room join', function(msg) {
		alert("failed to join room ");
	});
});

function submitName() {
	var name = document.getElementById('name-input-box').value;
	document.getElementById('name-input-box').value = "";

	socket.emit('set name', {
		uId: user.uId,
		name: name
	});

}

function createRoom() {
	socket.emit('create room', {
		playerId: user.uId
	});
	console.log("created room");
}

function joinRoom() {
	var enteredRoomId = document.getElementById('room-input-box').value;
	document.getElementById('room-input-box').value = "";
	socket.emit('join room', {
		playerId: user.uId,
		roomId: enteredRoomId
	});

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