module.exports = function(browserInstance) {

	var element = browserInstance.element;

	var clearUser = function(){
		clearLocalStorage();
		refresh();
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

	var joinRoom = function(roomId) {
		var joinRoomButton = element(by.id('room-join-button'));
		var roomCodeBox = element(by.id('room-input-box'));
		roomCodeBox.sendKeys(roomId);
		joinRoomButton.click();
		browserInstance.waitForAngular();
	};

	var leaveLobby = function() {
		var leaveLobbyButton = element(by.id('leave-lobby-button'));
		leaveLobbyButton.click();
		browserInstance.waitForAngular();
	};

	var getRoomId = function() {
		return element(by.binding('roomId')).getText();
	};

	var startGame = function() {
		var startGameButton = element(by.id('start-game-button'));
		startGameButton.click();
		browserInstance.waitForAngular();
	};

	var submitFirstAnswer = function() {
		var rows = element.all(by.exactRepeater("answer in userHand()"));
		rows.first().element(by.id("answer")).click();
		browserInstance.waitForAngular();
	};

	var submitFirstVote = function() {
		var submitVoteButtons = element.all(by.id("answer"));
		submitVoteButtons.first().click();
		browserInstance.waitForAngular();
	};

	var startNewRound = function() {
		var newRoundButton = element(by.id('next-round-button'));
		newRoundButton.click();
		browserInstance.waitForAngular();
	};

	var finishGame = function() {
		var finishGameButton = element(by.id('finish-game-button'));
		finishGameButton.click();
		browserInstance.waitForAngular();
	};

	var backToStart = function() {
		var backToStartButton = element(by.id('back-to-start-button'));
		backToStartButton.click();
		browserInstance.waitForAngular();
	};

	var activateSidebar = function() {
		var sidebarButton = element(by.id('sidebar-button'));
		sidebarButton.click();
		browserInstance.waitForAngular();
	};

	return {
		element: element,
		clearUser: clearUser,
		getIndex: getIndex,
		submitName: submitName,
		refresh: refresh,
		clearLocalStorage: clearLocalStorage,
		createRoom: createRoom,
		joinRoom: joinRoom,
		leaveLobby: leaveLobby,
		getRoomId: getRoomId,
		startGame: startGame,
		submitFirstAnswer: submitFirstAnswer,
		submitFirstVote: submitFirstVote,
		startNewRound: startNewRound,
		finishGame: finishGame,
		backToStart: backToStart,
		activateSidebar: activateSidebar
	};
};