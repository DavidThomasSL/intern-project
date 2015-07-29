var clonageUser = require("./helpers/browserHelper.js");

describe('When playing a game', function() {

	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can submit an answer', function() {

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

		firstClonageUser.submitFirstAnswer();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);

	});

	it('can be redirected to a voting page once everyone submitted', function() {

		secondClonageUser.submitFirstAnswer();
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);

	});

	it('can see what everyone submitted', function() {
		expect(firstClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2);
		expect(secondClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2);

	});

	it('can vote for an answer', function() {
		firstClonageUser.submitFirstVote();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);

		firstClonageUser.clearUser();
		browser2.close();
	});
});