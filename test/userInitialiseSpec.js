var clonageUser = require("./helpers/browserHelper.js");

describe('When registering as a user', function() {

	var firstClonageUser;

	beforeEach(function() {
		firstClonageUser = new clonageUser(browser);
		firstClonageUser.getHomepage();
	});

	it('can enter a name and move to joining a room', function() {
		firstClonageUser.submitName("Tom");
		expect(element(by.id('signup-container')).isPresent()).toBe(false);
		expect(element(by.id('room-join-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);

	});

	it('users name is shown on the joining room page', function() {
		firstClonageUser.submitName("Tom");
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
		expect(element(by.binding('getUserName')).getText()).toBe('Tom');
		expect(element(by.id('room-input-box')).isPresent()).toBe(true);
	});

	it('on refresh, name is remebered and user goes straight to joining a room', function() {

		firstClonageUser.submitName("Tom");
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
		expect(element(by.binding('getUserName')).getText()).toBe('Tom');
		expect(element(by.id('room-join-container')).isDisplayed()).toBe(true);

	});

	it('if session storage times out, user has to enter name again', function() {

		firstClonageUser.clearLocalStorage();
		firstClonageUser.refresh();

		expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);

	});
});