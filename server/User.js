var uuid = require('node-uuid');

function User(socket) {
	//Create a new user (called when creating a new user )
	this.uId = uuid.v1();
	this.name = undefined;
	this.roomId = "";
	this.socket = socket;
	this.readyToProceed = false;
	this.image = "";
}

/*
	Sends the user details to the client via the users socket
*/
User.prototype.sendUserDetails = function() {

	//get the users data as an object first
	var data = this.getUserDetails();
	this.socket.emit("USER details", {user:data});
};

/*
	Emits an event with given data on the user's socket
*/
User.prototype.emit = function(eventName, data) {

	this.socket.emit(eventName, data);
};

/*
	Gathers the users data in an object (without socket as it cannot be serailized)
*/
User.prototype.getUserDetails = function() {

	var userDetails = {
		uId: this.uId,
		name: this.name,
		roomId: this.roomId,
		readyToProceed: this.readyToProceed
	};

	return userDetails;
};

User.prototype.toString = function() {
	// body...
	var string = this.getUserDetails();

	return string;
};

module.exports = User;
