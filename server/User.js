var uuid = require('node-uuid');

function User(socket) {

	var self = this;
	//Create a new user (called when creating a new user )
	this.uId = uuid.v1();
	this.name = undefined;
	this.roomId = "";
	this.socket = socket;
	this.readyToProceed = false;
	this.isObserver = false;
	this.image = "";
	this.isBot = false;

	/*
	Sends the user details to the client via the users socket
*/
	self.sendUserDetails = function() {

		//get the users data as an object first
		var data = self.getUserDetails();
		self.emit("USER details", {
			user: data
		});
	};

	/*
		Emits an event with given data on the user's socket
	*/
	self.emit = function(eventName, data) {
		self.socket.emit(eventName, data);
	};

	/*
		Gathers the users data in an object (without socket as it cannot be serailized)
	*/
	self.getUserDetails = function() {

		var userDetails = {
			uId: this.uId,
			name: this.name,
			roomId: this.roomId,
			readyToProceed: this.readyToProceed,
			isObserver: this.isObserver,
			image: this.image
		};

		return userDetails;
	};


	self.toString = function() {
		var string = self.getUserDetails();
		return string;
	};
}

module.exports = User;
