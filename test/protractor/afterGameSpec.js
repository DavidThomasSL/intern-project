var clonageUser = require("./helpers/browserHelper.js");

describe('After ending the game', function() {

	var MAX_ROUNDS = 2;
	var POINTS_PER_VOTE = 50;

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

			// set round number low to prevent jasmine timeouts on circleCI
			firstClonageUser.setRoundNumber(MAX_ROUNDS);

			firstClonageUser.ready();
			secondClonageUser.ready();
		});

		//taking function out of loop as jshint complains
		var userSubmitAnswer = function(text) {
			cardsToSubmit = parseInt(text[5]); //PICK X.
			firstClonageUser.submitFirstAnswers(cardsToSubmit);
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
		};

		//change value here if we change the number of rounds
		for (var i = 0; i < MAX_ROUNDS; i++) {
			firstClonageUser.getBlankSpaces().then(userSubmitAnswer);

			firstClonageUser.submitFirstVote();
			secondClonageUser.submitFirstVote();

			firstClonageUser.ready();
			secondClonageUser.ready();
		}

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

	});
	it('can see players scores', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * POINTS_PER_VOTE).toString());

	});

	it('can see players names', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');

	});

	it('can see players ranks', function() {
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.rank')).getText()).toContain('#1');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.rank')).getText()).toContain('#1');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.rank')).getText()).toContain('#1');
	});

	it('on refresh can see scores, names and ranks', function() {
		firstClonageUser.refresh();
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * 50).toString());
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toEqual((MAX_ROUNDS * 50).toString());
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.rank')).getText()).toContain('#1');
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
