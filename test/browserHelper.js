module.exports = function(browserInstance) {

	var element = browserInstance.element;

	var getHomepage = function(){
		browserInstance.get('/');
		browserInstance.waitForAngular();
		console.log("refreshing");
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


	return {
		getHomepage: getHomepage,
		submitName: submitName,
		refresh: refresh,
		clearLocalStorage: clearLocalStorage
	};
};