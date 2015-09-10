var clonageUser = require("./helpers/browserHelper.js");

describe('When starting a game', function() {

	var HAND_SIZE;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('a player can become ready and this can be seen by all players', function() {
		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		secondClonageUser.joinRoom();
		firstClonageUser.ready();
		expect(firstClonageUser.element(by.id('ready-button')).getText()).toEqual('Not Ready');
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');

	});

	it('can start the game after everyone is ready', function() {
		secondClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
	});

	it('can see a question', function() {
		expect(firstClonageUser.element(by.id('round-question')).getText().length).not.toEqual(0);
	});

	it('can see possible answer cards', function() {
		HAND_SIZE = 10;

		expect(firstClonageUser.element.all(by.repeater("answer in userHand()")).count()).toEqual(HAND_SIZE);
	});

	it('on refresh can see questions and answers again', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(firstClonageUser.element(by.id('round-question')).getText().length).not.toEqual(0);
		expect(firstClonageUser.element.all(by.repeater("answer in userHand()")).count()).toEqual(HAND_SIZE);

		firstClonageUser.clearUser();
		browser2.close();
	});
});
