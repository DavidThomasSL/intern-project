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
		the message is passed to the callback provided by the service when it registered
	*/
	function registerListener(listenerName, listenerCallbacks) {
		var newListener = {};
		newListener.listenerCallbacks = listenerCallbacks;
		newListener.name = listenerName;
		listenerList.push(newListener);
	}


	//--------------------------
	//SOCKET EVENT LISTENERS
	// WHen recieving an event from the server, check which registered listener the event is for
	// Call the callback associated with that eventName for that listener
	//------------------------

	//This sets of the user registeration sequence, very messy, do not normally use
	socket.on('connect', function(data) {
		listenerList.forEach(function(listener) {
			if (listener.name === "USER") {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === "connect") {
						listenerCallback.eventAction(data);
					}
				});
			}
		});
	});

	socket.on("USER details", function(data) {
		_setListenerEventAction("USER details");
		onMessageFunction(data);
	});

	socket.on("USER room join", function(data) {
		_setListenerEventAction("USER room join");
		onMessageFunction(data);
	});

	socket.on("USER hand", function(data) {
		_setListenerEventAction("USER hand");
		onMessageFunction(data);
	});

	socket.on("GAME question", function(data) {
		_setListenerEventAction("GAME question");
		onMessageFunction(data);
	});

	socket.on("GAME answers", function(data) {
		_setListenerEventAction("GAME answers");
		onMessageFunction(data);
	});

	socket.on("GAME timeout", function(data) {
		_setListenerEventAction("GAME timeout");
		onMessageFunction(data);
	});

	socket.on("USER play again", function(data) {
		_setListenerEventAction("USER play again");
		onMessageFunction(data);
	});

	socket.on("GAME playerRoundResults", function(data) {
		_setListenerEventAction("GAME playerRoundResults");
		onMessageFunction(data);
	});

	socket.on("GAME finish", function(data) {
		_setListenerEventAction("GAME finish");
		onMessageFunction(data);
	});

	socket.on("ROOM details", function(data) {
		_setListenerEventAction("ROOM details");
		onMessageFunction(data);
	});

	socket.on("ROOM messages", function(data) {
		_setListenerEventAction("ROOM messages");
		onMessageFunction(data);
	});

	socket.on("ROUTING", function(data) {
		_setListenerEventAction("ROUTING");
		onMessageFunction(data);
	});

	socket.on("NOTIFICATION message", function(data) {
		_setListenerEventAction("NOTIFICATION message");
		onMessageFunction(data);
	});


	/*
		Takes an event name, sent by the server
		Finds which listenerService the event is for
		Sets the onMessageFucntion to be the required callback for the listenerService event
		as set when it registered
	*/

	function _getListenerList() {
		return listenerList;
	}

	function _getOnMessageFunction() {
		return onMessageFunction;
	}

	function _setListenerEventAction(event) {

		var splitEvent = event.split(" ");
		var eventService = splitEvent[0];
		var eventName = splitEvent.slice(1);
		eventName = eventName.join(" ");

		listenerList.forEach(function(listener) {
			if (listener.name === eventService) {
				listener.listenerCallbacks.forEach(function(listenerCallback) {
					if (listenerCallback.eventName === eventName) {
						onMessageFunction = listenerCallback.eventAction;
					}
				});
			}
		});
	}

	return {
		sendMessage: sendMessage,
		registerListener: registerListener,
		_getListenerList: _getListenerList,
		_setListenerEventAction: _setListenerEventAction,
		_getOnMessageFunction: _getOnMessageFunction
	};

}]);
