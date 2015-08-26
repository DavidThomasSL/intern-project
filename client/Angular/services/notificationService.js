ClonageApp.service('notificationService', ['communicationService', function(communicationService) {

	var currentNotificationMessage = "";
	var currentNotificatonType = undefined;
	var messageListenerList = [];
	var actionListenerList = [];


	function getCurrentNotificationMessage() {
		return currentNotificationMessage;
	}

	/*
		Registers a controllers scope as an error listener
		They will be notified when an error is recieved
	*/
	function registerMessageListener(notificationCallback) {
		var notificationListener = {
			notificationCallback: notificationCallback
		};
		messageListenerList.push(notificationListener);
	}

	function registerActionListener(notificationCallback) {

		var notificationListener = {
			notificationCallback: notificationCallback
		};

		actionListenerList.push(notificationListener);
	}

	/*
		---------------
		    COMMUNCATION LAYER API
		    These are functions called by the communcation
		    service when it recives a message for the user service
		---------------
		*/

	function _recieveNotificationMessage(data) {
		currentNotificationMessage = data.text;
		currentNotificatonType = data.type;
		notifyMessageListeners();
	}

	// Received a notification that the user can interact with
	function _recieveNotificationActionable(data) {
		notifyActionListeners(data);
	}

	/*
    ---------------
        REGISTERING COMMUNCATION API WITH LAYER
        Must register the user service with the communcation service,
        and provide an api to call back when recieving an event
    ----------------
     */

	communicationService.registerListener("NOTIFICATION", [{
		eventName: "message",
		eventAction: _recieveNotificationMessage
	}, {
		eventName: "actionable",
		eventAction: _recieveNotificationActionable
	}]);

	/*
		Notifies all listeners of the error message coming through from the communication channel
	*/
	function notifyMessageListeners() {
		messageListenerList.forEach(function(notificationListener) {
			notificationListener.notificationCallback(currentNotificationMessage, currentNotificatonType);
		});
	}

	function notifyActionListeners(data) {
		actionListenerList.forEach(function(notificationListener) {
			notificationListener.notificationCallback(data);
		});
	}


	return {
		getCurrentNotifcationMessage: getCurrentNotificationMessage,
		registerMessageListener: registerMessageListener,
		registerActionListener: registerActionListener
	};


}]);
