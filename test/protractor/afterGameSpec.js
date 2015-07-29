var clonageUser = require("./helpers/browserHelper.js");

describe('After ending the game', function() {

	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can be redirected to a end game page', function() {

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
		secondClonageUser.submitFirstAnswer();

		firstClonageUser.submitFirstVote();
		secondClonageUser.submitFirstVote();

		firstClonageUser.finishGame();

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

	});
	it('can see players scores', function() {

		expect(firstClonageUser.element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.score')).getText()).toContain('50');
		expect(firstClonageUser.element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.score')).getText()).toContain('50');
		expect(secondClonageUser.element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.score')).getText()).toContain('50');
		expect(secondClonageUser.element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.score')).getText()).toContain('50');
	});

	it('can see players names', function() {

		expect(firstClonageUser.element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.repeater('result in finalresults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.repeater('result in finalresults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');

	});

	it('can go back to start page after clicking finish', function() {

		firstClonageUser.backToStart();
		secondClonageUser.backToStart();
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);
		expect(browser.getCurrentUrl()).toMatch(/\/joining/);

		firstClonageUser.clearUser();
		browser2.close();
	});
});