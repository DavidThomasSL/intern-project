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
			firstClonageUser.ready();
			secondClonageUser.ready();
		});


		//change value here if we change the number of rounds
		for (var i = 0; i < 3; i++) {
			firstClonageUser.submitFirstAnswer();
			secondClonageUser.submitFirstAnswer();

			firstClonageUser.submitFirstVote();
			secondClonageUser.submitFirstVote();

			firstClonageUser.ready();
			secondClonageUser.ready();
		}

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

	});
	it('can see players scores', function() {
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual('150');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual('150');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual('150');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual('150');
	});

	it('can see players names', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');

	});

	it('on refresh can see scores and names', function() {
		firstClonageUser.refresh();
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual('150');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual('150');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
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