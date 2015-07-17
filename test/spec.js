// spec.js
describe('Clonage App', function() {

	beforeEach(function() {
		browser.get('/');
		browser.waitForAngular();
	});

	it('should have a title', function() {
		expect(browser.getTitle()).toEqual('CLONAGE');
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


		it('only name entry should be visible', function() {
			expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
			expect(element(by.id('join-create-container')).isDisplayed()).toBe(false);
			expect(element(by.id('main-game-container')).isDisplayed()).toBe(false);
		});

		it('can enter a name and move to joining a room', function() {
			clonageSignup.submitName("Bob");

			expect(element(by.id('signup-container')).isDisplayed()).toBe(false);
			expect(element(by.id('join-create-container')).isDisplayed()).toBe(true);
		});

		it('on refresh, remebers name and goes straight to joining a room', function() {

			clonageSignup.submitName("Bob");
			clonageSignup.refresh();

			expect(element(by.model('enteredName')).getAttribute('value')).toBe('Bob');
			expect(element(by.id('signup-container')).isDisplayed()).toBe(false);
			expect(element(by.id('join-create-container')).isDisplayed()).toBe(true);
		});

		it('if session storage times out, user has to enter name again', function() {

			clonageSignup.submitName("Bob");

			browser.executeScript('window.sessionStorage.clear();');
	   		browser.executeScript('window.localStorage.clear();');

	   		clonageSignup.refresh();

			expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
			expect(element(by.id('join-create-container')).isDisplayed()).toBe(false);
		});

	});

	describe('As a registered user', function() {

	});



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
	var createRoomButton = element(by.id('create-room-button'));

	this.get = function() {
		browser.get('/');
		browser.waitForAngular();
	};

	this.submitName = function(name) {
		nameInputBox.sendKeys(name);
		nameSubmitButton.click();
	};

	this.createRoom = function() {
		createRoomButton.click();
	};

	this.refresh = function() {
		this.get();
	};
};
