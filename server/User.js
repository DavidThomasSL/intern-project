var uuid = require('node-uuid');

function User(socket) {

	var self = this;
	//Create a new user (called when creating a new user )
	self.uId = uuid.v1();
	self.name = undefined;
	self.roomId = "";
	self.socket = socket;
	self.readyToProceed = false;

	/*
	Sends the user details to the client via the users socket
*/
	self.sendUserDetails = function() {

		//get the users data as an object first
		var data = self.getUserDetails();
		self.socket.emit("USER details", {
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
			uId: self.uId,
			name: self.name,
			roomId: self.roomId,
			readyToProceed: self.readyToProceed
		};

		return userDetails;
	};

	self.toString = function() {
		// body...
		var string = self.getUserDetails();

		return string;
	};
}

module.exports = User;
