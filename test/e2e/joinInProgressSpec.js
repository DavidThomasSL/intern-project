var clonageUser = require("./helpers/browserHelper.js");

describe('When trying to join a game in progress', function() {

	var MAX_ROUNDS;
	var BOT_NUM = 2;
	var cardsToSubmit;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can see an error message when trying to join a room with a game in progress', function() {

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();
		firstClonageUser.setBotsOn(BOT_NUM); // set bots so we can start the game with one user

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.ready(); //start the game in the room
		secondClonageUser.joinRoom(); //try a join now

		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(browser2.getCurrentUrl()).toMatch(/\/joining/);
		expect(secondClonageUser.element(by.css(".toast")).isPresent()).toBe(true);
		expect(secondClonageUser.element(by.css(".toast")).getText()).toContain('Game already in progress');

	});

	it('can click the game in progress error to join the game as an observer and are taken to the observer question page', function() {

		secondClonageUser.element(by.css(".toast")).click();

		expect(browser2.getCurrentUrl()).toMatch(/\/observeQ/);
		//magic just happened

		firstClonageUser.clearUser();
		browser2.close();

	});

});
