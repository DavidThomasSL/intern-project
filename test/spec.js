// spec.js
describe('Clonage App', function() {

	beforeEach(function() {
		browser.get('/');
		browser.waitForAngular();
	});


	it('should have a title', function() {
		expect(browser.getTitle()).toEqual('CLONAGE');
	});

	it('should direct to the signup page', function() {
		expect(browser.getCurrentUrl()).toMatch(/\//);
	});

	describe('When registering as a user', function() {

		var clonageSignup;

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);

		});

		it('can enter a name and move to joining a room', function() {

			clonageSignup.submitName("Bob");
			expect(element(by.id('signup-container')).isPresent()).toBe(false);
			expect(element(by.id('room-join-container')).isPresent()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/joining/);

		});

		it('users name is shown on the joining room page', function() {

			clonageSignup.submitName("Bob");
			expect(browser.getCurrentUrl()).toMatch(/\/joining/);
			expect(element(by.binding('getUserName')).getText()).toBe('Bob');
			expect(element(by.id('room-input-box')).isPresent()).toBe(true);

		});

		it('on refresh, name is remebered and user goes straight to joining a room', function() {

			clonageSignup.submitName("Bob");
			browser.refresh();
			browser.waitForAngular();

			expect(browser.getCurrentUrl()).toMatch(/\/joining/);
			expect(element(by.binding('getUserName')).getText()).toBe('Bob');
			expect(element(by.id('room-join-container')).isDisplayed()).toBe(true);

		});

		it('if session storage times out, user has to enter name again', function() {

			browser.executeScript('window.sessionStorage.clear();');
			browser.executeScript('window.localStorage.clear();');
			browser.refresh();

			expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);

		});
	});

	describe('As a registered user', function() {

		var clonageSignup;

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);

		});

		it('can see the room join/create page', function() {

			clonageSignup.submitName("Mike");

			expect(element(by.id('signup-container')).isPresent()).toBe(false);
			expect(element(by.id('room-join-container')).isDisplayed()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/joining/);

		});
	});

	describe('When creating a room', function() {

		var clonageSignup;
		var clonageRoomJoinPage;
		var roomId;

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);
			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

		});

		it('user can create a new room and are automatically put into it', function() {

			clonageSignup.submitName("Ben");
			clonageRoomJoinPage.createRoom();

			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			element(by.binding('roomId')).getText().then(function(text) {
				roomId = text;
			});

		});

		it('users in a lobby can see the room code', function() {

			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			expect(element(by.binding('roomId')).getText().then(function(text) {
				roomId = text.split(" ")[2];
				return roomId.length;
			})).toBe(5);

		});

		it('user can see themselves in the room', function() {

			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);

			expect(element.all(by.repeater('user in getUsersInRoom()')).get(0).getText()).toBe('Ben');

		});

		it('on refresh the user is put back in the room lobby', function() {

			browser.refresh();
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/room/);

		});

	});


	describe('When joining an existing room', function() {

		var clonageSignup;
		var clonageRoomJoinPage;
		var clonageSignup2;
		var clonageRoomJoinPage2;
		var browser2;
		var element2;
		var roomId;


		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);
			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

			browser2 = browser.forkNewDriverInstance(false, true);
			element2 = browser2.element;
			clonageSignup2 = new ClonageSignupPage(browser2);
	 		clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
	 		cloneStartGame2 = new ClonageStartGamePage(browser2);
			clonageSignup2.get();
	 		clonageSignup2.submitName('Alice');
	 		clonageRoomJoinPage2.createRoom();
	 		element2(by.binding('roomId')).getText().then(function(text) {
				roomId = text.split(" ")[2];
			});

			browser.executeScript('window.sessionStorage.clear();');
	 		browser.executeScript('window.localStorage.clear();');

			clonageSignup.get();
	 		clonageSignup.submitName('John');

		});

		afterEach(function() {

			browser2.close();
		});


		it('can join an existing room and go into the lobby and see other users in the room', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);

			expect(element.all(by.repeater('user in getUsersInRoom()')).get(0).getText()).toBe('Alice');
			expect(element.all(by.repeater('user in getUsersInRoom()')).get(1).getText()).toBe('John');

		});

		// it('if other user quits in the room user can see that without updating', function() {

		// 	clonageRoomJoinPage.joinRoom(roomId);
		// 	browser2.element(by.buttonText("Go Back")).click();

		// 	browser2.waitForAngular();
		// 	expect(element2.all(by.repeater('user in getUsersInRoom()')).count()).toBe(2);

		// });

		it('if other use joins room in the room user can see that without updating', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			browser2.element(by.buttonText("Go Back")).click();
			browser2.element(by.id('room-input-box')).sendKeys(roomId);
			browser2.element(by.id('room-join-button')).click();
			browser2.waitForAngular();

			expect(element.all(by.repeater('user in getUsersInRoom()')).count()).toBe(2);
		});

	});

	describe('When starting a game', function() {

		var clonageSignup;
		var clonageRoomJoinPage;
		var clonageStartGame;
		var clonageSignup2;
		var clonageRoomJoinPage2;
		var clonageStartGame2;
		var browser2;
		var element2;
		var roomId;

			// Create a new user on another browser who creates a room
			// must create a new user and join that room

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);
			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

			browser2 = browser.forkNewDriverInstance(false, true);
			element2 = browser2.element;

			//in browser 2 submit name, create room
			clonageSignup2 = new ClonageSignupPage(browser2);
	 		clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
	 		cloneStartGame2 = new ClonageStartGamePage(browser2);
			clonageSignup2.get();
	 		clonageSignup2.submitName('Alice');
	 		clonageRoomJoinPage2.createRoom();
	 		element2(by.binding('roomId')).getText().then(function(text) {
				roomId = text.split(" ")[2];
			});

			browser.executeScript('window.sessionStorage.clear();');
	 		browser.executeScript('window.localStorage.clear();');

			clonageSignup.get();
	 		clonageSignup.submitName('John');

		});

		afterEach(function() {

			browser2.close();

		});

		it('can start the game', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			expect(browser.getCurrentUrl()).toMatch(/\/question/);

		});

		it('can see a question', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			expect(browser.getCurrentUrl()).toMatch(/\/question/);
			expect(element(by.id('roundQuestion')).getText().length).not.toEqual(0);

		});

		it('can see possible answer cards', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			expect(browser.getCurrentUrl()).toMatch(/\/question/);
			expect(element.all(by.repeater("answer in userHand()")).count()).toEqual(7);

		});
	});

	describe('When playing a game', function() {

		var clonageSignup;
		var clonageRoomJoinPage;
		var clonageStartGame;
		var clonageSignup2;
		var clonageRoomJoinPage2;
		var clonageStartGame2;
		var browser2;
		var element2;
		var roomId;
		var playGame;
		var playGame2;

		// Create a new user on another browser who creates a room
		// must create a new user and join that room

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);
			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

	 		browser2 = browser.forkNewDriverInstance(false, true);
	 		element2 = browser2.element;

			clonageSignup2 = new ClonageSignupPage(browser2);
	 		clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
	 		cloneStartGame2 = new ClonageStartGamePage(browser2);
			clonageSignup2.get();
	 		clonageSignup2.submitName('Alice');
	 		clonageRoomJoinPage2.createRoom();
	 		element2(by.binding('roomId')).getText().then(function(text) {
				roomId = text.split(" ")[2];
			});

			browser.executeScript('window.sessionStorage.clear();');
	 		browser.executeScript('window.localStorage.clear();');

			clonageSignup.get();
	 		clonageSignup.submitName('John');

		});

		 afterEach(function() {

			browser2.close();

		});

		it('can submit an answer', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			playGame = new ClonagePlayGamePage(browser);
			playGame.submitAnswer();
			expect(browser.getCurrentUrl()).toMatch(/\/wait/);

		});

		it('can be redirected to a voting page once everyone submitted', function() {

		 	clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			playGame = new ClonagePlayGamePage(browser);
			playGame.submitAnswer();

			playGame = new ClonagePlayGamePage(browser2);
			playGame.submitAnswer();
	 		browser2.waitForAngular();
	 		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);

		});

		it('can see what everyone submitted', function() {

		 	clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			playGame = new ClonagePlayGamePage(browser);
			playGame.submitAnswer();

			playGame = new ClonagePlayGamePage(browser2);
			playGame.submitAnswer();
	 		browser2.waitForAngular();
	 		expect(element2.all(by.repeater("answer in answers()")).count()).toEqual(2);

		});

		it('can vote for an answer', function() {

		 	clonageRoomJoinPage.joinRoom(roomId);
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();
			playGame = new ClonagePlayGamePage(browser);
			playGame.submitAnswer();

			playGame = new ClonagePlayGamePage(browser2);
			playGame.submitAnswer();
	 		browser2.waitForAngular();

	 		playGame.submitVote();
	 		expect(browser2.getCurrentUrl()).toMatch(/\/wait/);

		});
	});

describe('After each round', function() {

		var clonageSignup;
		var clonageRoomJoinPage;
		var clonageStartGame;
		var clonageSignup2;
		var clonageRoomJoinPage2;
		var clonageStartGame2;
		var browser2;
		var element2;
		var roomId;
		var playGame;
		var playGame2;

		// Create a new user on another browser who creates a room
		// must create a new user and join that room

		beforeEach(function() {

			clonageSignup = new ClonageSignupPage(browser);
			clonageRoomJoinPage = new ClonageRoomJoinPage(browser);

	 		browser2 = browser.forkNewDriverInstance(false, true);
	 		element2 = browser2.element;

			clonageSignup2 = new ClonageSignupPage(browser2);
	 		clonageRoomJoinPage2 = new ClonageRoomJoinPage(browser2);
	 		cloneStartGame2 = new ClonageStartGamePage(browser2);
			clonageSignup2.get();
	 		clonageSignup2.submitName('Alice');
	 		clonageRoomJoinPage2.createRoom();
	 		element2(by.binding('roomId')).getText().then(function(text) {
				roomId = text.split(" ")[2];
			});

			browser.executeScript('window.sessionStorage.clear();');
	 		browser.executeScript('window.localStorage.clear();');

			clonageSignup.get();
	 		clonageSignup.submitName('John');

		});

		 afterEach(function() {

			browser2.close();

		});

		it('can be redirected to a results page', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			browser.waitForAngular();
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();

			playGame = new ClonagePlayGamePage(browser);
			playGame2 = new ClonagePlayGamePage(browser2);

			playGame.submitAnswer();
			playGame2.submitAnswer();

	 		playGame.submitVote();
			playGame2.submitVote();

			browser2.waitForAngular();
			expect(browser2.getCurrentUrl()).toMatch(/\/results/);

		});

		it('can see who submitted what answers', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			browser.waitForAngular();
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();

			playGame = new ClonagePlayGamePage(browser);
			playGame2 = new ClonagePlayGamePage(browser2);

			playGame.submitAnswer();
			playGame2.submitAnswer();

	 		playGame.submitVote();
			playGame2.submitVote();

			browser2.waitForAngular();
			expect(browser2.getCurrentUrl()).toMatch(/\/results/);
			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
	 		expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');

		});

		it('can be assigned points if someone voted for my answer', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			browser.waitForAngular();
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();

			playGame = new ClonagePlayGamePage(browser);
			playGame2 = new ClonagePlayGamePage(browser2);

			playGame.submitAnswer();
			playGame2.submitAnswer();

	 		playGame.submitVote();
			playGame2.submitVote();

			browser2.waitForAngular();
			expect(browser2.getCurrentUrl()).toMatch(/\/results/);
			expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('points');
	 		expect(element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('points');

		});

		it('can start a new round', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			browser.waitForAngular();
			clonageStartGame = new ClonageStartGamePage(browser);
			clonageStartGame.startGame();

			playGame = new ClonagePlayGamePage(browser);
			playGame2 = new ClonagePlayGamePage(browser2);

			playGame.submitAnswer();
			playGame2.submitAnswer();

	 		playGame.submitVote();
			playGame2.submitVote();

			browser2.waitForAngular();
			browser2.element(by.buttonText("Next Round")).click();
			browser2.waitForAngular();
			expect(browser2.getCurrentUrl()).toMatch(/\/question/);

		});
	});
});


var ClonageSignupPage = function(browser) {

	element = browser.element;

	var nameInputBox = element(by.id('name-input-box'));
	var nameSubmitButton = element(by.id('name-submit-button'));

	this.get = function() {
		browser.get('/');
		browser.waitForAngular();
	};

	this.submitName = function(name) {
		nameInputBox.sendKeys(name);
		nameSubmitButton.click();
	};

	this.refresh = function() {
		this.get();
	};
};

var ClonageRoomJoinPage = function(browser) {

	element = browser.element;

	var createRoomButton = element(by.id('create-room-button'));
	var roomInputBox = element(by.id('room-input-box'));
	var roomJoinButton = element(by.id('room-join-button'));

	this.createRoom = function() {
		createRoomButton.click();
	};

	this.getRoomId = function() {
		var room;
		browser.element(by.binding('roomId')).getText().then(function(text) {
 			room = text.split(" ")[2];
 		});
 		return room;
	};

	this.joinRoom = function(roomId) {
		roomInputBox.sendKeys(roomId);
		roomJoinButton.click();
	};
};

var ClonageStartGamePage = function(browser) {

	element = browser.element;

	this.startGame = function() {
		expect(browser.getCurrentUrl()).toMatch(/\/room/);
		element(by.buttonText("Start Game")).click();
	};
};

var ClonagePlayGamePage = function(browser) {

	element = browser.element;

	this.submitAnswer = function() {
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		var rows = element.all(by.repeater("answer in userHand()"));
		rows.first().element(by.id("answer")).click();
		browser.element(by.buttonText("Submit Answer")).click();
 		browser.waitForAngular();
	};

	this.submitVote = function() {
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		var rows = element.all(by.repeater("answer in answers()"));
		rows.first().element(by.id("answer")).click();
		browser.element(by.buttonText("Submit Vote")).click();
 		browser.waitForAngular();
	};
};
