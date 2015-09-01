var clonageUser = require("./helpers/browserHelper.js");

describe('After ending the game', function() {

	var MAX_ROUNDS;
	var POINTS_PER_VOTE;

	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can be redirected to an end game page', function() {

		MAX_ROUNDS = 1;

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			// set round number low to prevent jasmine timeouts on circleCI
			firstClonageUser.setRoundNumber(MAX_ROUNDS);

			secondClonageUser.joinRoom(roomId);
			expect(browser.getCurrentUrl()).toMatch(/\/room/);
			expect(browser2.getCurrentUrl()).toMatch(/\/room/);

			firstClonageUser.ready();
			secondClonageUser.ready();
			expect(browser.getCurrentUrl()).toMatch(/\/question/);
			expect(browser2.getCurrentUrl()).toMatch(/\/question/);

			firstClonageUser.getBlankSpaces().then(function(text) {

				cardsToSubmit = parseInt(text[5]); //PICK X.
				firstClonageUser.submitFirstAnswers(cardsToSubmit);
				secondClonageUser.submitFirstAnswers(cardsToSubmit);
				firstClonageUser.submitFirstVote();
				secondClonageUser.submitFirstVote();

				expect(browser.getCurrentUrl()).toMatch(/\/results/);
				expect(browser2.getCurrentUrl()).toMatch(/\/results/);

			});

		});

		browser.wait( function(){
		  return element(by.id('end-game-container')).isPresent();
		}, 1000);

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);


	});
	it('can see players scores', function() {
		POINTS_PER_VOTE = 50;


		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());

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
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.points')).getText()).toContain((MAX_ROUNDS * POINTS_PER_VOTE).toString());
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
