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

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');

	});

	it('can see who voted for what answers', function() {

		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');

	});

	it('can see all player scores and points in the game from the sidebar', function() {

		firstClonageUser.activateSidebar();
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).count()).toEqual(2);
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(0).element(by.binding('currentResult.player.points')).getText()).toEqual('50 points');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.points')).getText()).toEqual('50 points');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(0).element(by.binding('currentResult.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.name')).getText()).toContain('Alice');

	});

	it('can see their own rank and ranks are equal if scores are equal', function() {
		expect(firstClonageUser.element(by.id('personal-rank')).isDisplayed()).toBe(true);
		expect(firstClonageUser.element(by.id('personal-rank')).getText()).toBe('#1');
		expect(firstClonageUser.element(by.id('personal-rank')).getText()).toBe('#1');
	});

	it('can refresh and still see results and scores in page and in sidebar', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/results/);
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.player.name')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');

		firstClonageUser.activateSidebar();
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).count()).toEqual(2);
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(0).element(by.binding('currentResult.player.points')).getText()).toEqual('50 points');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.points')).getText()).toEqual('50 points');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(0).element(by.binding('currentResult.player.name')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.name')).getText()).toContain('Alice');
	});

	it('can replace unwanted cards in hand and points are reduced as a result', function () {
		firstClonageUser.showReplaceableCards();
		firstClonageUser.getFirstReplaceCardText().then(function(originalText){
			firstClonageUser.replaceFirstCard();
			expect(element.all(by.exactRepeater("answer in userHand()")).first().element(by.id("answer")).getText()).not.toMatch(originalText);
			expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.points')).getText()).toEqual('40 points');
		});
	});

	it('can ready up for next round and this can be seen by everyone', function() {
		secondClonageUser.ready();
		expect(secondClonageUser.element(by.id('ready-button')).getText()).toEqual('Not Ready');
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');
	});

	it('can start a new round when everyone is ready', function() {

		firstClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);

		firstClonageUser.clearUser();
		browser2.close();
	});
});
