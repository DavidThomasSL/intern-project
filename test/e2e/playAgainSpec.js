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

		expect(firstClonageUser.element(by.id('play-again-button')).isPresent()).toBe(true);
		expect(secondClonageUser.element(by.id('play-again-button')).isPresent()).toBe(true);

	});

	it('can press play again and no other player in the room can', function() {

		firstClonageUser.playAgain();
		expect(secondClonageUser.element(by.id('play-again-button')).isPresent()).toBe(false);

	});


	it('can press play again and be redirected to a new room and automatically be put in it', function() {

		expect(firstClonageUser.element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(firstClonageUser.element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/room/);
		firstClonageUser.getRoomId().then(function(text) {
			newRoomId = text.split(" ")[2];
			expect(newRoomId).not.toEqual(roomId);
		});

	});

	it('all other player will get a toast inviting them to join the new game', function() {

		expect(secondClonageUser.element(by.id('toaster')).isPresent()).toBe(true);

	});

	it('if click on the toast player joins the new game', function() {

		secondClonageUser.element(by.id('toaster')).click();
		browser2.waitForAngular();

		expect(secondClonageUser.element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(secondClonageUser.element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(browser2.getCurrentUrl()).toMatch(/\/room/);

	});

	it('all players are able to see who else joins the new game without refreshing', function() {
		expect(firstClonageUser.element.all(by.repeater('user in getActiveUsersInRoom()')).count()).toBe(2);
		expect(secondClonageUser.element.all(by.repeater('user in getActiveUsersInRoom()')).count()).toBe(2);

	});

	it('can start the new game once everyone is ready', function() {
		firstClonageUser.ready();
		secondClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/question/);

		firstClonageUser.clearUser();
		browser2.close();

	});

});
