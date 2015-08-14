ClonageApp.service('notificationService', ['communicationService', function(communicationService) {

	var currentNotificationMessage = "";
	var currentNotificatonType = undefined;
	var notificationListenerList = [];

	function getCurrentNotificationMessage() {
		return currentNotificationMessage;
	}

	/*
		Registers a controllers scope as an error listener
		They will be notified when an error is recieved
	*/
	function registerNotificationListener(notificationCallback) {
		var notificationListener = {notificationCallback: notificationCallback};
		notificationListenerList.push(notificationListener);
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
		notifyListeners();
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
	}]);

	/*
		Notifies all listeners of the error message coming through from the communication channel
	*/
	function notifyListeners(){
		notificationListenerList.forEach(function(notificationListener) {
			notificationListener.notificationCallback(currentNotificationMessage, currentNotificatonType);
		});
	}


	return {
		getCurrentNotifcationMessage: getCurrentNotificationMessage,
		registerNotificationListener: registerNotificationListener
	};


}]);
