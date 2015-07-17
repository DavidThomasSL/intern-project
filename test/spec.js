// spec.js
describe('Clonage App', function() {

	beforeEach(function() {
		browser.get('/');
		browser.waitForAngular();
	});

	it('should have a title', function() {
		expect(browser.getTitle()).toEqual('CLONAGE');
	});

	it('only name entry should be visible', function() {
		expect(element(by.id('testid')).getText()).toEqual("Enter your name");
	});

});
