module.exports = function(browserInstance) {

	var element = browserInstance.element;

	var clearUser = function() {
		clearLocalStorage();
		refresh();
		getIndex();
	};

	var getIndex = function() {
		browserInstance.get('/');
		browserInstance.waitForAngular();
	};

	var submitName = function(name) {
		var choosePlayerButton = element(by.id('choose-player-button'));
		choosePlayerButton.click();
		browserInstance.waitForAngular();
		var nameInputBox = element(by.id('name-input-box'));
		var nameSubmitButton = element(by.id('name-submit-button'));
		nameInputBox.sendKeys(name);
		nameSubmitButton.click();
		browserInstance.waitForAngular();
	};

	var toggleMessenger = function() {
		element(by.id('toggle-messenger')).click();
		browserInstance.waitForAngular();
	};

	var joinAsObserver = function(name) {
		var chooseObserverButton = element(by.id('choose-observer-button'));
		chooseObserverButton.click();
		browserInstance.waitForAngular();
	};

	var submitMessage = function(message) {
		browserInstance.waitForAngular();
		var messageInput = element(by.id('message-box'));
		messageInput.sendKeys(message);
		browserInstance.waitForAngular();
		element(by.id('submit-message')).click();
		browserInstance.waitForAngular();
	};

	var refresh = function() {
		browserInstance.refresh();
		browserInstance.waitForAngular();
	};

	var clearLocalStorage = function() {
		browserInstance.executeScript('window.sessionStorage.clear();');
		browserInstance.executeScript('window.localStorage.clear();');
		browserInstance.waitForAngular();
	};

	var createRoom = function() {
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

	var setBotsOn = function(number) {
		element(by.id('set-bot-dropdown')).click();
		element.all(by.id("bot-select-dropdown")).get(0).element(by.linkText(number.toString())).click();
		browserInstance.waitForAngular();
	};

	var setRoundNumber = function(number) {

		var text = number.toString();
		if (text === '8') {
			text = "8 (Default)";
		} // This is the text in the link for number 8

		element(by.id('set-round-dropdown')).click();
		browserInstance.waitForAngular();

		element.all(by.id("round-select-dropdown")).get(0).element(by.linkText(text)).click();
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

	var getBlankSpaces = function() {
		return element(by.binding('currentQuestion().pick')).getText();
	};

	var startGame = function() {
		var startGameButton = element(by.id('start-game-button'));
		startGameButton.click();
		browserInstance.waitForAngular();
	};

	var ready = function() {
		var readyButton = element(by.id('ready-button'));
		readyButton.click();
		browserInstance.waitForAngular();
	};

	var submitFirstAnswers = function(numberToSubmit) {
		element.all(by.exactRepeater("answer in userHand()")).then(function(answers) {
			for (var i = 0; i < numberToSubmit; i++) {
				answers[i].click();
				browserInstance.waitForAngular();
			}
		});
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

	var getCardText = function(index) {
		var rows = element.all(by.exactRepeater("answer in userHand()"));
		return rows.get(index).element(by.id("answer")).getText();
	};


	var replaceHand = function() {
		var replaceHandButton = element(by.id('replace-hand-button'));
		replaceHandButton.click();
		browserInstance.waitForAngular();
	};

	var backToStart = function() {
		var backToStartButton = element(by.id('back-to-start-button'));
		backToStartButton.click();
		browserInstance.waitForAngular();
	};

	var activateSidebar = function() {
		var sidebarButton = element(by.id('navbar-expand-button'));
		sidebarButton.click();
		browserInstance.waitForAngular();
	};

	var openGameRankings = function() {
		var rankingButton = element(by.id('game-ranking-dropdown-button'));
		rankingButton.click();
		browserInstance.waitForAngular();
	};

	var playAgain = function() {
		var playAgainButton = element(by.id('play-again-button'));
		playAgainButton.click();
		browserInstance.waitForAngular();
	};

	return {
		element: element,
		clearUser: clearUser,
		getIndex: getIndex,
		submitName: submitName,
		joinAsObserver: joinAsObserver,
		refresh: refresh,
		clearLocalStorage: clearLocalStorage,
		createRoom: createRoom,
		joinRoom: joinRoom,
		leaveLobby: leaveLobby,
		getRoomId: getRoomId,
		getBlankSpaces: getBlankSpaces,
		startGame: startGame,
		submitFirstAnswer: submitFirstAnswer,
		submitFirstAnswers: submitFirstAnswers,
		submitFirstVote: submitFirstVote,
		replaceHand: replaceHand,
		getCardText: getCardText,
		backToStart: backToStart,
		activateSidebar: activateSidebar,
		ready: ready,
		setBotsOn: setBotsOn,
		setRoundNumber: setRoundNumber,
		submitMessage: submitMessage,
		toggleMessenger: toggleMessenger,
		openGameRankings: openGameRankings,
		playAgain: playAgain
	};
};