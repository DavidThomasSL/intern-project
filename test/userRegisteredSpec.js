var clonageUser = require("./helpers/browserHelper.js");

describe('As a registered user', function() {

	var firstClonageUser = new clonageUser(browser);

	it('can see the room join/create page', function() {
		firstClonageUser.getIndex();
		firstClonageUser.submitName("Mike");
		expect(element(by.id('signup-container')).isPresent()).toBe(false);
		expect(element(by.id('room-join-container')).isDisplayed()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
	});
});