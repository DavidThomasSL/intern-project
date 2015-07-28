module.exports = function(browserInstance) {

	var element = browserInstance.element;

	var resetSession = function() {
		browserInstance.executeScript('window.sessionStorage.clear();');
		browserInstance.executeScript('window.localStorage.clear();');
		browserInstance.waitForAngular();
		getIndex();
	};

	var getIndex = function(){
		browserInstance.get('/');
		browserInstance.waitForAngular();
	};

	var submitName = function(name) {
		var nameInputBox = element(by.id('name-input-box'));
		var nameSubmitButton = element(by.id('name-submit-button'));
		nameInputBox.sendKeys(name);
		nameSubmitButton.click();
		browserInstance.waitForAngular();
	};

	var refresh = function(){
		browserInstance.refresh();
		browserInstance.waitForAngular();
	};

	var clearLocalStorage = function(){
		browserInstance.executeScript('window.sessionStorage.clear();');
		browserInstance.executeScript('window.localStorage.clear();');
		browserInstance.waitForAngular();
	};

	var createRoom = function(){
		var createRoomButton = element(by.id('create-room-button'));
		createRoomButton.click();
		browserInstance.waitForAngular();
	};

	var getRoomId = function() {
		return element(by.binding('roomId')).getText();
		// .then(function(text) {
		// 	return text;
		// });
	};

	return {
		getIndex: getIndex,
		submitName: submitName,
		refresh: refresh,
		clearLocalStorage: clearLocalStorage,
		createRoom: createRoom,
		getRoomId: getRoomId,
		resetSession: resetSession
	};
};