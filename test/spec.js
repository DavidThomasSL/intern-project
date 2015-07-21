// spec.js
var webdriver = require('selenium-webdriver');

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
			clonageSignup = new ClonageSignupPage();
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
			expect(element(by.binding('getUserName')).getText()).toBe('Hi Bob!');
			expect(element(by.id('room-input-box')).isPresent()).toBe(true);
		});

		it('on refresh, name is remebered and user goes straight to joining a room', function() {

			clonageSignup.submitName("Bob");
			browser.refresh();
			browser.waitForAngular();

			expect(browser.getCurrentUrl()).toMatch(/\/joining/);
			expect(element(by.binding('getUserName')).getText()).toBe('Hi Bob!');
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
			clonageSignup = new ClonageSignupPage();
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
			clonageSignup = new ClonageSignupPage();
			clonageRoomJoinPage = new ClonageRoomJoinPage();
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

		// it('user can see themselves in the room as \'Me!\'', function() {
		// 	clonageRoomJoinPage.joinRoom(roomId);
		// 	expect(browser.getCurrentUrl()).toMatch(/\/room/);
		// 	expect(element.all(by.repeater('user in usersInRoom')).get(0).getText()).toBe('Me!');
		// });

		it('on refresh the user is put back in the room lobby', function() {
			browser.refresh();
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/room/);
		});

	});

	describe('When joining an exsiting room', function() {
		var clonageSignup;
		var clonageRoomJoinPage;
		var browser2;
		var element2;
		var roomId;

		/*
			Create a new user on another browser who creates a room
			must create a new user and join that room
		*/
		beforeEach(function() {
			clonageSignup = new ClonageSignupPage();
			clonageRoomJoinPage = new ClonageRoomJoinPage();

			browser2 = browser.forkNewDriverInstance(false, true);
			element2 = browser2.element;

			browser2.get('/');
			browser2.waitForAngular();

			element2(by.id('name-input-box')).sendKeys('Alice');
			element2(by.id('name-submit-button')).click();
			browser2.waitForAngular();
			element2(by.id('create-room-button')).click();

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

		it('can join an extisting room and go into the lobby and see other users in the room', function() {

			clonageRoomJoinPage.joinRoom(roomId);

			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			expect(element(by.id('room-join-container')).isPresent()).toBe(false);
			expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);

			expect(element.all(by.repeater('user in getUsersInRoom()')).get(0).getText()).toBe('Alice');
			expect(element.all(by.repeater('user in getUsersInRoom()')).get(1).getText()).toBe('John');
		});

		it('if other use joins quits in the room user can see that without updating', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			browser2.element(by.buttonText("Go Back")).click();
			browser2.waitForAngular();

			expect(element.all(by.repeater('user in getUsersInRoom()')).count()).toBe(1);
		});

		it('if other use joins room in the room user can see that without updating', function() {

			clonageRoomJoinPage.joinRoom(roomId);
			browser2.element(by.buttonText("Go Back")).click();
			browser2.element(by.id('room-input-box')).sendKeys(roomId);
			browser2.element(by.id('room-join-button')).click();
			browser2.waitForAngular();

			expect(element.all(by.repeater('user in getUsersInRoom()')).count()).toBe(2);
		});
	});

});

var ClonageSignupPage = function() {

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

var ClonageRoomJoinPage = function() {

	var createRoomButton = element(by.id('create-room-button'));
	var roomInputBox = element(by.id('room-input-box'));
	var roomJoinButton = element(by.id('room-join-button'));

	this.createRoom = function() {
		createRoomButton.click();
	};

	this.joinRoom = function(roomId) {
		roomInputBox.sendKeys(roomId);
		roomJoinButton.click();
	};
};