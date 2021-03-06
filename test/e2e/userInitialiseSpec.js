var clonageUser = require("./helpers/browserHelper.js");

describe('When registering as a user', function() {

	var firstClonageUser = new clonageUser(browser);

	it('can enter a name and move to joining a room', function() {
		expect(browser.getCurrentUrl()).toMatch(/\//);
		firstClonageUser.getIndex();
		firstClonageUser.submitName("Tom");
		expect(element(by.id('signup-container')).isPresent()).toBe(false);
		expect(element(by.id('room-join-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);

	});

	it('on refresh, user goes straight to joining a room', function() {

		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
		expect(element(by.id('room-join-container')).isDisplayed()).toBe(true);

	});

	it('if session storage times out, user has to enter name again', function() {

		firstClonageUser.clearLocalStorage();
		firstClonageUser.refresh();
		firstClonageUser.getIndex();
		expect(element(by.id('signup-container')).isDisplayed()).toBe(true);
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);

		firstClonageUser.clearUser();
	});
});