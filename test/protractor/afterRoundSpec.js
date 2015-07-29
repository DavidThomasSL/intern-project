var clonageUser = require("./helpers/browserHelper.js");

describe('After each round', function() {

	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can be redirected to a results page', function() {

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

		expect(browser.getCurrentUrl()).toMatch(/\/results/);
		expect(browser2.getCurrentUrl()).toMatch(/\/results/);
	});

	it('can see who submitted what answers', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('Alice');

	});

	it('can be assigned points if someone voted for my answer', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('points');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('points');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playerName')).getText()).toContain('points');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playerName')).getText()).toContain('points');

	});

	it('can start a new round', function() {

		firstClonageUser.startNewRound();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);

		firstClonageUser.clearUser();
		browser2.close();
	});
});