var clonageUser = require("./helpers/browserHelper.js");

describe('When playing as a observer', function() {

	var BOT_NUM;
	var MAX_ROUNDS;

	var resultWait = 3000;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('Can register as a observer', function() {
		firstClonageUser.getIndex();
		firstClonageUser.joinAsObserver();

		expect(browser.getCurrentUrl()).toMatch(/\/joining/);

	});

	it('Can see all the rooms that are available without refresh', function() {
		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');
		secondClonageUser.createRoom();

		expect(browser2.getCurrentUrl()).toMatch(/\/room/);

		expect(firstClonageUser.element.all(by.repeater('room in allRoomsAvailable()')).count()).toBeGreaterThan(0); // don't know how many rooms will have timed out by this point

	});

	it('can see the number of users in the room', function() {
		expect(browser2.getCurrentUrl()).toMatch(/\/room/);
		expect(secondClonageUser.element(by.binding("roomId()")).getText()).toContain("ROOM CODE:");

		expect(firstClonageUser.element.all(by.repeater('room in allRoomsAvailable()')).last().element(by.binding('room.id')).getText()).toMatch("ROOM");
		expect(firstClonageUser.element.all(by.repeater('room in allRoomsAvailable()')).last().element(by.binding('room.usersInRoom.length')).getText()).toEqual("1");
	});

	it('Can refresh and still see all the rooms available', function() {
		firstClonageUser.refresh();
		expect(firstClonageUser.element.all(by.repeater('room in allRoomsAvailable()')).count()).toBeGreaterThan(0);

	});

	it('Can join a room by only pressing on the room button in the joining page', function() {

		firstClonageUser.element.all(by.repeater('room in allRoomsAvailable()')).last().element(by.id('observer-join-game-button')).click();
		expect(browser.getCurrentUrl()).toMatch(/\/observeLobby/);
	});

	it('After starting the game, observer and user are put to relevant pages', function() {
		MAX_ROUNDS = 2;
		BOT_NUM = 3;

		secondClonageUser.setRoundNumber(MAX_ROUNDS);
		secondClonageUser.setBotsOn(BOT_NUM); // ENABLE BOTS
		//Playing with bots here to avoid needed three browser instances

		secondClonageUser.ready();
		browser.waitForAngular();
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

		browser2.wait( function(){
		  return element(by.id('observer-question')).isPresent();
		}, resultWait);

		expect(browser.getCurrentUrl()).toMatch(/\/observeQ/);
		expect(browser2.getCurrentUrl()).toMatch(/\/question/);
	});

	it('After finishing a game, observer and user are put to relevant pages', function() {

		secondClonageUser.getBlankSpaces().then(function(text) {

			cardsToSubmit = parseInt(text[5]); //PICK X.
			secondClonageUser.submitFirstAnswers(cardsToSubmit);
			secondClonageUser.submitFirstVote();

		});

		browser.wait( function(){
		  return element(by.id('end-game-container')).isPresent();
		}, resultWait);

		expect(browser.getCurrentUrl()).toMatch(/\/observeEG/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);

		firstClonageUser.clearUser();
		browser2.close();

	});

});

