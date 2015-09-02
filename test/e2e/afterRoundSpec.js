var clonageUser = require("./helpers/browserHelper.js");

describe('After each round', function() {

	var HAND_SIZE = 10;
	var currentHand = [];

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
			firstClonageUser.setRoundNumber(8);
			secondClonageUser.joinRoom(roomId);
			firstClonageUser.ready();
			secondClonageUser.ready();
		});

		firstClonageUser.getBlankSpaces().then(function(text) {
			cardsToSubmit = parseInt(text[5]); //PICK X.
			firstClonageUser.submitFirstAnswers(cardsToSubmit);
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
		});

		firstClonageUser.submitFirstVote();
		secondClonageUser.submitFirstVote();

		expect(browser.getCurrentUrl()).toMatch(/\/results/);
		expect(browser2.getCurrentUrl()).toMatch(/\/results/);
	});

	it('can see who submitted what answers', function() {

		expect(firstClonageUser.element.all(by.id('results-table-row')).get(1).element(by.binding('submission.player.name')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.id('results-table-row')).get(0).element(by.binding('submission.player.name')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.id('results-table-row')).get(1).element(by.binding('submission.player.name')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.id('results-table-row')).get(0).element(by.binding('submission.player.name')).getText()).toContain('John');

	});

	// it('can see who voted for what answers', function() {

	// 	expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
	// 	expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
	// 	expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
	// 	expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');

	// });

	it('can see all player scores and points in the game from the sidebar', function() {

		firstClonageUser.openGameRankings();
		expect(firstClonageUser.element.all(by.id("dropdown-row")).count()).toEqual(2);

		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.rank')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.points')).getText()).toContain('50 points');


		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.rank')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.points')).getText()).toContain('50 points');

	});

	it('can see their own rank and ranks are equal if scores are equal', function() {
		expect(firstClonageUser.element(by.binding('rank()')).isDisplayed()).toBe(true);
		expect(firstClonageUser.element(by.binding('rank()')).getText()).toBe('Rank #1');
		expect(firstClonageUser.element(by.binding('rank()')).getText()).toBe('Rank #1');
	});

	it('can refresh and still see results and scores in page and in sidebar', function() {

		firstClonageUser.refresh();
		firstClonageUser.openGameRankings();
		expect(firstClonageUser.element.all(by.id("dropdown-row")).count()).toEqual(2);

		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.rank')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(0).element(by.binding('submission.player.points')).getText()).toContain('50 points');


		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.rank')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.id("dropdown-row")).get(1).element(by.binding('submission.player.points')).getText()).toContain('50 points');

	});

	it('can see a timer', function() {
		var timer = firstClonageUser.element(by.id('countdown'));
		expect(timer.isPresent()).toBe(true);
	});

	it('can have a counter that indicates number of seconds left', function() {
		var counter = firstClonageUser.element(by.binding('counter'));
		expect(counter.isPresent()).toBeLessThan(21);
	});

	it('can start a new round after time runs out', function() {

		// firstClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);

		firstClonageUser.clearUser();
		browser2.close();
	});
});
