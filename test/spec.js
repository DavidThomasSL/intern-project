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
			clonageSignup = new ClonageSignupPage();
			clonageSignup.get();
		});

		afterEach(function() {
			browser.executeScript('window.sessionStorage.clear();');
	   		browser.executeScript('window.localStorage.clear();');
		});

		//todo starts on joining page

		it('can enter a name and move to joining a room', function() {
			clonageSignup.submitName("Bob");
			expect(element(by.id('signup-container')).isPresent()).toBe(false);
			expect(element(by.id('room-join-container')).isPresent()).toBe(true);
			expect(browser.getCurrentUrl()).toMatch(/\/joining/);

		});

		// it('on refresh, name is remebered and user goes straight to joining a room', function() {

		// 	clonageSignup.submitName("Bob");
		// 	clonageSignup.refresh();

		// 	expect(element(by.model('enteredName')).getAttribute('value')).toBe('Bob');
		// 	expect(element(by.id('signup-container')).isDisplayed()).toBe(false);
		// 	expect(element(by.id('join-create-container')).isDisplayed()).toBe(true);
		// });

		// it('if session storage times out, user has to enter name again', function() {

		// 	clonageSignup.submitName("Bob");

		// 	browser.executeScript('window.sessionStorage.clear();');
	 //   		browser.executeScript('window.localStorage.clear();');

	 //   		clonageSignup.refresh();

		// 	expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
		// 	expect(element(by.id('join-create-container')).isDisplayed()).toBe(false);
		// });
	});

	// describe('As a registered user', function() {

	// 	var clonageRoomCreate;

	// 	beforeEach(function() {
	// 		var clonageSignup = new ClonageSignupPage();

	// 		clonageSignup.get();
	// 		clonageSignup.submitName("Bob");

	// 		clonageRoomCreate = new ClonageRoomCreatePage();

	// 	});

	// 	afterEach(function() {
	// 		browser.executeScript('window.sessionStorage.clear();');
	//    		browser.executeScript('window.localStorage.clear();');
	// 	});

	// 	it('can see the room join/create page', function() {
	// 		expect(element(by.id('signup-container')).isDisplayed()).toBe(false);
	// 		expect(element(by.id('join-create-container')).isDisplayed()).toBe(true);
	// 	});

	// 	it('can create a new room join are automatically put into it', function() {
	// 		clonageRoomCreate.createRoom();

	// 		expect(element(by.id('join-create-container')).isDisplayed()).toBe(false);
	// 		expect(element(by.id('main-game-container')).isDisplayed()).toBe(true);
	// 	});

	// 	it('in a lobby can see the room code as 0', function() {
	// 		clonageRoomCreate.createRoom();
	// 		browser.pause();
	// 		expect(element(by.model('$storage.roomId')).getAttribute('value')).toBe('0');



	// 	});

	// });



	// it('can create a room and move to room lobby', function() {


	// 	clonageSignup.submitName("Bob");
	// 	clonageSignup.createRoom();

	// 	expect(element(by.id('join-create-container')).isDisplayed()).toBe(false);
	// 	expect(element(by.id('main-game-container')).isDisplayed()).toBe(true);

	// });


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

var ClonageRoomCreatePage = function() {

	var createRoomButton = element(by.id('create-room-button'));

	this.createRoom = function() {
		createRoomButton.click();
	};
};
