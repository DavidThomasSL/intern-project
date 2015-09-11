var clonageUser = require("./helpers/browserHelper.js");

describe('When starting a game with BOTS', function() {

	var BOT_NUM;
	var MAX_ROUNDS;
	var resultWait = 4000;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('Can start a game with bots', function() {
		MAX_ROUNDS = 1;
		BOT_NUM = 3;

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.setBotsOn(BOT_NUM); // ENABLE BOTS

		secondClonageUser.joinRoom();

		// set round number low to prevent jasmine timeouts on circleCI
		firstClonageUser.setRoundNumber(MAX_ROUNDS);

		firstClonageUser.ready();
		secondClonageUser.ready();

		firstClonageUser.getBlankSpaces().then(function(text) {
			cardsToSubmit = parseInt(text[5]); //PICK X.
			firstClonageUser.submitFirstAnswers(cardsToSubmit);
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
		});

		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);
	});

	it('Can see your answers plus the bot answers', function() {
		expect(firstClonageUser.element.all(by.repeater("answer in visualiseAnswers()")).count()).toEqual(2 + BOT_NUM);
		expect(secondClonageUser.element.all(by.repeater("answer in visualiseAnswers()")).count()).toEqual(2 + BOT_NUM);
	});

	it('can vote for any answer', function() {
		firstClonageUser.submitFirstVote();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);

	});

	it('Taken to the resuls page after last person voted', function() {

		secondClonageUser.submitFirstVote();

		browser.wait( function(){
		  return browser.getCurrentUrl().then(function(url){
			  return (url === "http://localhost:8080/#/results/");
		  });
		}, 10000);

		expect(browser2.getCurrentUrl()).toMatch(/\/results/);
		expect(browser.getCurrentUrl()).toMatch(/\/results/);
	});

	it('can see all the answers that were submitted', function() {
		expect(firstClonageUser.element.all(by.id('results-table-row')).count()).toBe(2 + BOT_NUM);
		expect(secondClonageUser.element.all(by.id('results-table-row')).count()).toBe(2 + BOT_NUM);
	});

	it('can finish a game with bots', function() {

		browser.wait( function(){
		  return element(by.id('end-game-container')).isPresent();
		}, resultWait);

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

		firstClonageUser.clearUser();
		browser2.close();

	});
});
