describe('initial Tests', function() {

	it('should have a title', function() {
		browser.get('/');
		browser.waitForAngular();
		expect(browser.getTitle()).toEqual('CLONAGE');
	});

	it('should direct to the signup page', function() {
		expect(browser.getCurrentUrl()).toMatch(/\//);
	});

});