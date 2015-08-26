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
			secondClonageUser.joinRoom(roomId);
			firstClonageUser.ready();
			secondClonageUser.ready();

			//storing all the current cards in the users hand, used to test the replace hand button later on
			for (i = 0; i < HAND_SIZE; i++) {
				firstClonageUser.getCardText(i).then(pushTextToArray);
			}
		});
		function pushTextToArray(cardText) {
			currentHand.push(cardText);
		}

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

		// expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		// expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		// expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(0).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');
		// expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).get(1).element(by.binding('result.playersWhoVotedForThis.length')).getText()).toContain('1');

	});

	it('can see all player scores and points in the game from the sidebar', function() {

		firstClonageUser.openGameRankings();
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).count()).toEqual(2);

		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.rank')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.points')).getText()).toContain('50 points');


		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.rank')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.points')).getText()).toContain('50 points');

	});

	it('can see their own rank and ranks are equal if scores are equal', function() {
		expect(firstClonageUser.element(by.binding('rank()')).isDisplayed()).toBe(true);
		expect(firstClonageUser.element(by.binding('rank()')).getText()).toBe('Rank #1');
		expect(firstClonageUser.element(by.binding('rank()')).getText()).toBe('Rank #1');
	});

	it('can refresh and still see results and scores in page and in sidebar', function() {

		firstClonageUser.refresh();
		firstClonageUser.openGameRankings();
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).count()).toEqual(2);

		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.rank')).getText()).toContain('John');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(0).element(by.binding('currentResult.player.points')).getText()).toContain('50 points');


		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.rank')).getText()).toContain('Alice');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.rank')).getText()).toContain('#1');
		expect(firstClonageUser.element.all(by.repeater("currentResult in getPlayerRoundResults()")).get(1).element(by.binding('currentResult.player.points')).getText()).toContain('50 points');

	});

	it('can replace unwanted cards in hand and points are reduced as a result', function() {

		firstClonageUser.replaceHand();
		firstClonageUser.openGameRankings();
		expect(firstClonageUser.element.all(by.repeater('currentResult in getPlayerRoundResults()')).get(1).element(by.binding('currentResult.player.points')).getText()).toEqual('0 points');
	});

	it('can see the players at the bottom of the page', function() {
		expect(firstClonageUser.element.all(by.repeater('user in getActiveUsersInRoom()')).count()).toBe(2);
	});

	it('can ready up for next round and this can be seen by everyone', function() {
		secondClonageUser.ready();
		expect(secondClonageUser.element(by.id('ready-button')).getText()).toEqual('Not Ready');
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-ready');
	});

	it('can start a new round when everyone is ready and all cards have been replaced', function() {

		firstClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);

		//testing if all the cards are different once we start the next round
		for(i=0; i<HAND_SIZE; i++){
		expect(firstClonageUser.element.all(by.exactRepeater("answer in userHand()")).get(i).element(by.id("answer")).getText()).not.toMatch(currentHand[i]);
		}

		firstClonageUser.clearUser();
		browser2.close();
	});
});