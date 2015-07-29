var clonageUser = require("./helpers/browserHelper.js");

describe('initalTests', function() {

	it('should have a title', function() {
		browser.get('/');
		browser.waitForAngular();
		expect(browser.getTitle()).toEqual('CLONAGE');
	});

	it('should direct to the signup page', function() {
		expect(browser.getCurrentUrl()).toMatch(/\//);
	});


});


// 	describe('When playing a game', function() {

// 		var clonageSignup;
// 		var clonageRoomJoinPage;
// 		var clonageStartGame;
// 		var clonageSignup2;
// 		var clonageRoomJoinPage2;
// 		var clonageStartGame2;
// 		var browser2;
// 		var element2;
// 		var roomId;
// 		var playGame;
// 		var playGame2;

// 		// Create a new user on another browser who creates a room
// 		// must create a new user and join that room

// 		beforeEach(function() {

// 			clonageSignup = new ClonageSignupPage(browser);
// 			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

// 			browser2 = browser.forkNewDriverInstance(false, true);
// 			element2 = browser2.element;

// 			clonageSignup2 = new ClonageSignupPage(browser2);
// 			clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
// 			cloneStartGame2 = new ClonageStartGamePage(browser2);
// 			clonageSignup2.get();
// 			clonageSignup2.submitName('Alice');
// 			clonageRoomJoinPage2.createRoom();
// 			element2(by.binding('roomId')).getText().then(function(text) {
// 				roomId = text.split(" ")[2];
// 			});

// 			browser.executeScript('window.sessionStorage.clear();');
// 			browser.executeScript('window.localStorage.clear();');

// 			clonageSignup.get();
// 			clonageSignup.submitName('John');

// 		});

// 		afterEach(function() {

// 			browser2.close();

// 		});

// 		it('can submit an answer', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();
// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame.submitAnswer();
// 			expect(browser.getCurrentUrl()).toMatch(/\/wait/);

// 		});

// 		it('can be redirected to a voting page once everyone submitted', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();
// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame.submitAnswer();

// 			playGame = new ClonagePlayGamePage(browser2);
// 			playGame.submitAnswer();
// 			browser2.waitForAngular();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/vote/);

// 		});

// 		it('can see what everyone submitted', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();
// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame.submitAnswer();

// 			playGame = new ClonagePlayGamePage(browser2);
// 			playGame.submitAnswer();
// 			browser2.waitForAngular();
// 			expect(element2.all(by.repeater("answer in answers()")).count()).toEqual(2);

// 		});

// 		it('can vote for an answer', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();
// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame.submitAnswer();

// 			playGame = new ClonagePlayGamePage(browser2);
// 			playGame.submitAnswer();
// 			browser2.waitForAngular();

// 			playGame.submitVote();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/wait/);

// 		});
// 	});

// 	describe('After each round', function() {

// 		var clonageSignup;
// 		var clonageRoomJoinPage;
// 		var clonageStartGame;
// 		var clonageSignup2;
// 		var clonageRoomJoinPage2;
// 		var clonageStartGame2;
// 		var browser2;
// 		var element2;
// 		var roomId;
// 		var playGame;
// 		var playGame2;

// 		// Create a new user on another browser who creates a room
// 		// must create a new user and join that room

// 		beforeEach(function() {

// 			clonageSignup = new ClonageSignupPage(browser);
// 			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

// 			browser2 = browser.forkNewDriverInstance(false, true);
// 			element2 = browser2.element;

// 			clonageSignup2 = new ClonageSignupPage(browser2);
// 			clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
// 			cloneStartGame2 = new ClonageStartGamePage(browser2);
// 			clonageSignup2.get();
// 			clonageSignup2.submitName('Alice');
// 			clonageRoomJoinPage2.createRoom();
// 			element2(by.binding('roomId')).getText().then(function(text) {
// 				roomId = text.split(" ")[2];
// 			});

// 			browser.executeScript('window.sessionStorage.clear();');
// 			browser.executeScript('window.localStorage.clear();');

// 			clonageSignup.get();
// 			clonageSignup.submitName('John');

// 		});

// 		afterEach(function() {

// 			browser2.close();

// 		});

// 		it('can be redirected to a results page', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			browser2.waitForAngular();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/results/);

// 		});

// 		it('can see who submitted what answers', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			browser.waitForAngular();
// 			browser2.waitForAngular();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			browser2.waitForAngular();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/results/);
// 			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
// 			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');

// 		});

// 		it('can be assigned points if someone voted for my answer', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			browser2.waitForAngular();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			browser2.waitForAngular();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/results/);
// 			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('points');
// 			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('points');

// 		});

// 		it('can start a new round', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			browser2.waitForAngular();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			browser2.waitForAngular();
// 			browser2.element(by.buttonText("Next Round")).click();
// 			browser2.waitForAngular();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/question/);

// 		});
// 	});

// 	describe('After ending the game', function() {

// 		var clonageSignup;
// 		var clonageRoomJoinPage;
// 		var clonageStartGame;
// 		var clonageSignup2;
// 		var clonageRoomJoinPage2;
// 		var clonageStartGame2;
// 		var browser2;
// 		var element2;
// 		var roomId;
// 		var playGame;
// 		var playGame2;

// 		// Create a new user on another browser who creates a room
// 		// must create a new user and join that room

// 		beforeEach(function() {

// 			clonageSignup = new ClonageSignupPage(browser);
// 			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

// 			browser2 = browser.forkNewDriverInstance(false, true);
// 			element2 = browser2.element;

// 			clonageSignup2 = new ClonageSignupPage(browser2);
// 			clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
// 			cloneStartGame2 = new ClonageStartGamePage(browser2);
// 			clonageSignup2.get();
// 			clonageSignup2.submitName('Alice');
// 			clonageRoomJoinPage2.createRoom();
// 			element2(by.binding('roomId')).getText().then(function(text) {
// 				roomId = text.split(" ")[2];
// 			});

// 			browser.executeScript('window.sessionStorage.clear();');
// 			browser.executeScript('window.localStorage.clear();');

// 			clonageSignup.get();
// 			clonageSignup.submitName('John');

// 		});

// 		afterEach(function() {

// 			browser2.close();

// 		});

// 		it('can be redirected to a end game page', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			playGame.finishGame();
// 			expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);
// 		});

// 		it('can see players scores', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			playGame.finishGame();

// 			expect(element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.score')).getText()).toContain('50');
// 			expect(element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.score')).getText()).toContain('50');
// 		});

// 		it('can see players names', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			playGame.finishGame();

// 			expect(element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('Alice');
// 			expect(element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('John');
// 		});

// 		it('can go back to start page after clicking finish', function() {

// 			clonageRoomJoinPage.joinRoom(roomId);

// 			browser.waitForAngular();
// 			clonageStartGame = new ClonageStartGamePage(browser);
// 			clonageStartGame.startGame();

// 			playGame = new ClonagePlayGamePage(browser);
// 			playGame2 = new ClonagePlayGamePage(browser2);

// 			playGame.submitAnswer();
// 			playGame2.submitAnswer();

// 			playGame.submitVote();
// 			playGame2.submitVote();

// 			playGame.finishGame();
// 			playGame.backToStart();

// 			expect(browser.getCurrentUrl()).toMatch(/\/joining/);
// 		});
// 	});
// });


// var ClonageSignupPage = function(browserInstance) {

// 	var element = browserInstance.element;

// 	var nameInputBox = element(by.id('name-input-box'));
// 	var nameSubmitButton = element(by.id('name-submit-button'));

// 	this.get = function() {
// 		browserInstance.get('/');
// 		browserInstance.waitForAngular();
// 	};

// 	this.submitName = function(name) {
// 		nameInputBox.sendKeys(name);
// 		nameSubmitButton.click();
// 		browserInstance.waitForAngular();
// 	};

// 	this.refresh = function() {
// 		this.get();
// 		browserInstance.waitForAngular();
// 	};
// };

// var ClonageRoomJoinPage = function(browserInstance) {

// 	var element = browserInstance.element;

// 	var createRoomButton = element(by.id('create-room-button'));
// 	var roomInputBox = element(by.id('room-input-box'));
// 	var roomJoinButton = element(by.id('room-join-button'));

// 	this.createRoom = function() {
// 		createRoomButton.click();
// 		browserInstance.waitForAngular();
// 	};

// 	this.getRoomId = function() {
// 		var room;
// 		browserInstance.element(by.binding('roomId')).getText().then(function(text) {
// 			room = text.split(" ")[2];
// 		});
// 		browserInstance.waitForAngular();
// 		return room;
// 	};

// 	this.joinRoom = function(roomId) {
// 		roomInputBox.sendKeys(roomId);
// 		roomJoinButton.click();
// 		browserInstance.waitForAngular();
// 	};
// };

// var ClonageStartGamePage = function(browserInstance) {

// 	var element = browserInstance.element;

// 	this.startGame = function() {
// 		expect(browserInstance.getCurrentUrl()).toMatch(/\/room/);
// 		element(by.buttonText("Start Game")).click();
// 		browserInstance.waitForAngular();
// 	};
// };

// var ClonagePlayGamePage = function(browserInstance) {

// 	var element = browserInstance.element;

// 	this.submitAnswer = function() {

// 		browserInstance.waitForAngular();

// 		//expect(browser.getCurrentUrl()).toMatch(/\/question/);
// 		var rows = element.all(by.exactRepeater("answer in userHand()"));
// 		browserInstance.waitForAngular();
// 		rows.first().element(by.id("answer")).click();

// 		browserInstance.element(by.buttonText("Submit Answer")).click();
// 		browserInstance.waitForAngular();
// 	};

// 	this.submitVote = function() {

// 		//expect(browserInstance.getCurrentUrl()).toMatch(/\/vote/);

// 		var submitVoteButtons = element.all(by.id("answer"));
// 		submitVoteButtons.first().click();

// 		browserInstance.element(by.buttonText("Submit Vote")).click();
// 		browserInstance.waitForAngular();
// 	};

// 	this.finishGame = function() {
// 		browserInstance.element(by.id("finish-game-button")).click();
// 		browserInstance.waitForAngular();
// 	};

// 	this.backToStart = function() {
// 		browserInstance.element(by.id("restart-button")).click();
// 		browserInstance.waitForAngular();
// 	};