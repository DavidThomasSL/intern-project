ClonageApp.service('communicationService', ['socket', function(socket) {

	var listenerList = [];
	var onMessageFunction = null;

	/*
		Communicates with the server.
		Sends a socket message with the given event name and data.
		When the socket has finished returns the callback
	*/
	function sendMessage(eventName, data, callback) {
		socket.emit(eventName, data);
		callback();
	}

	/*
		Adds a new key value pair of a listener (a service who wants to recieve messages from the socket layer)
		and that listener's local scope.

		When a message comes on the socket layer,
		the $scope of the relevant listener is used to pass the message on
	*/
	function registerListener(listenerName, listenerCallbacks) {
		var newListener = {};
		newListener.listenerCallbacks = listenerCallbacks;
		newListener.name = listenerName;
		console.log("Registered listener");
		console.log(newListener);
		listenerList.push(newListener);
	}

	//--------------------------
	//SOCKET EVENT LISTENERS
	// WHen recieving an event from the server, check which registered listener the event is for
	// Call the callback associated with that eventName for that listener
	//------------------------


	//This sets of the user registeration sequence, very message, do not normally use
	socket.on('connect', function(data) {
		listenerList.forEach(function(listener) {
			if (listener.name === "USER") {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === "connect") {
						console.log("FOUND THE USER, DOING REGISTER");
						listenerCallback.eventAction(data);
					}
				});
			}
		});
	});

	socket.on("USER details", function(data) {
		listenerList.forEach(function(listener) {
			if (listener.name === "USER") {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === "details") {
						console.log("FOUND THE USER, DOING REGISTER");
						listenerCallback.eventAction(data);
					}
				});
			}
		});
	});

	socket.on("USER room join", function(data) {
		listenerList.forEach(function(listener) {
			if (listener.name === "USER") {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === "room join") {
						console.log("FOUND THE USER, DOING REGISTER");
						listenerCallback.eventAction(data);
					}
				});
			}
		});
	});

	socket.on("USER hand", function(data) {
		listenerList.forEach(function(listener) {
			if (listener.name === "USER") {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === "hand") {
						console.log("FOUND THE USER, DOING REGISTER");
						listenerCallback.eventAction(data);
					}
				});
			}
		});
	});

	return {
		sendMessage: sendMessage,
		registerListener: registerListener
	};

}]);
