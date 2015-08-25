var clonageUser = require("./helpers/browserHelper.js");

describe('When wanting to play again', function() {

	var MAX_ROUNDS;
	var POINTS_PER_VOTE;

	var roomId;
	var newRoomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can see a play again button', function() {

		MAX_ROUNDS = 2;

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
		expect(firstClonageUser.element(by.id('play-again-button')).isPresent()).toBe(true);
		expect(secondClonageUser.element(by.id('play-again-button')).isPresent()).toBe(true);

	});


});
