var clonageUser = require("./helpers/browserHelper.js");

describe('When starting a game', function() {

	var roomId;

	browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can start the game', function() {

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			secondClonageUser.joinRoom(roomId);
			firstClonageUser.startGame();
		});
		expect(browser.getCurrentUrl()).toMatch(/\/question/);

	});

	it('can see a question', function() {

		expect(firstClonageUser.element(by.id('roundQuestion')).getText().length).not.toEqual(0);

	});

	it('can see possible answer cards', function() {

		expect(firstClonageUser.element.all(by.repeater("answer in userHand()")).count()).toEqual(7);

		firstClonageUser.clearUser();
		secondClonageUser.clearUser();
	});
});