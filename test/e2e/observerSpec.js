var clonageUser = require("./helpers/browserHelper.js");

describe('When playing as a observer', function() {

	var BOT_NUM;
	var MAX_ROUNDS;
	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('Can register as a observer', function() {
		firstClonageUser.getIndex();
		firstClonageUser.joinAsObserver();

		expect(browser.getCurrentUrl()).toMatch(/\/joining/);

	});

	it('Can create a room as an observer and see the observer lobby screen', function() {
		firstClonageUser.createRoom();

		expect(browser.getCurrentUrl()).toMatch(/\/observeLobby/);
	});

	it('Another player can join and see the usual lobby screen with only themselves in it', function() {
		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			secondClonageUser.joinRoom(roomId);
			// set round number low to prevent jasmine timeouts on circleCI
		});

		expect(browser2.getCurrentUrl()).toMatch(/\/room/);
		expect(firstClonageUser.element.all(by.repeater('user in getActiveUsersInRoom()')).count()).toBe(1);

	});

	it('After starting the game, observer and user are put to relevant pages', function() {
		MAX_ROUNDS = 3;
		BOT_NUM = 3;


		secondClonageUser.setRoundNumber(MAX_ROUNDS);
		secondClonageUser.setBotsOn(BOT_NUM); // ENABLE BOTS
		//Playing with bots here to avoid needed three browser instances

		secondClonageUser.ready();

		expect(browser.getCurrentUrl()).toMatch(/\/observeQ/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);

	});

	it('After submission, observer and user are put to relevant pages', function() {


		secondClonageUser.getBlankSpaces().then(function(text) {
			cardsToSubmit = parseInt(text[5]); //PICK X.
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
		});

		expect(browser.getCurrentUrl()).toMatch(/\/observeV/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);
	});

	it('After voting, observer and user are put to relevant pages', function() {

		secondClonageUser.submitFirstVote();

		expect(browser.getCurrentUrl()).toMatch(/\/observeR/);
		expect(browser2.getCurrentUrl()).toMatch(/\/results/);
	});

	it('After moving to next round, observer and user are put to relevant pages', function() {

		secondClonageUser.ready();

		expect(browser.getCurrentUrl()).toMatch(/\/observeQ/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);
	});

	it('After finishing a game, observer and user are put to relevant pages', function() {

		//taking function out of loop as jshint complains
		var userSubmitAnswer = function(text) {
			cardsToSubmit = parseInt(text[5]); //PICK X.
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
		};

		console.log(MAX_ROUNDS + "should be 3");

		//change value here if we change the number of rounds
		for (var i = 0; i < MAX_ROUNDS - 1; i++) {
			console.log(MAX_ROUNDS);
			secondClonageUser.getBlankSpaces().then(userSubmitAnswer);
			secondClonageUser.submitFirstVote();
			secondClonageUser.ready();
		}

		expect(browser.getCurrentUrl()).toMatch(/\/observeEG/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

	});

});
