var clonageUser = require("./helpers/browserHelper.js");

describe('When trying to join a game in progress', function() {

	var MAX_ROUNDS;
	var BOT_NUM = 2;
	var roomId;
	var cardsToSubmit;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it("can't join a room that doesn't exist, and can see an error with useful text", function() {

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.joinRoom("thisdoesntexist");


		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
		expect(element(by.css(".toast")).isPresent()).toBe(true);
		expect(element(by.css(".toast")).getText()).toEqual('code "thisdoesntexist" does not match any existing room');

	});

	it('can see an error message when trying to join a room with a game in progress', function() {

		firstClonageUser.createRoom();
		firstClonageUser.setBotsOn(BOT_NUM); // set bots so we can start the game with one user

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2]; //["ROOM", "CODE", "XKFLS"]

			firstClonageUser.ready(); //start the game in the room

			secondClonageUser.joinRoom(roomId); //try a join now
		});

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
