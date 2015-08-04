ClonageApp.service('errorService', ['communicationService', function(communicationService) {

	var currentErrorMessage = "";
	var errorListenerList = [];

	function getCurrentErrorMessage() {
		return currentErrorMessage;
	}

	/*
		Registers a controllers scope as an error listener
		They will be notified when an error is recieved
	*/
	function registerErrorListener(errorCallback) {
		var errorListener = {errorCallback: errorCallback};
		errorListenerList.push(errorListener);
	}

	/*
		---------------
		    COMMUNCATION LAYER API
		    These are functions called by the communcation
		    service when it recives a message for the user service
		---------------
		*/

	function _recieveErrorMessage(data) {
		console.log("recieved error message");
		currentErrorMessage = data.errorText;
		notifyListeners();
	}

	/*
    ---------------
        REGISTERING COMMUNCATION API WITH LAYER
        Must register the user service with the communcation service,
        and provide an api to call back when recieving an event
    ----------------
     */

	communicationService.registerListener("ERROR", [{
		eventName: "message",
		eventAction: _recieveErrorMessage
	}]);

	/*
		Notifies all listeners of the error message coming through from the communication channel
	*/
	function notifyListeners(){
		errorListenerList.forEach(function(errorListener) {
			console.log("notifyListeners " + errorListener.errorCallback);
			errorListener.errorCallback(currentErrorMessage);
		});
	}


	return {
		getCurrentErrorMessage: getCurrentErrorMessage,
		registerErrorListener: registerErrorListener
	}


}]);