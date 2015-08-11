var clonageUser = require("./helpers/browserHelper.js");

describe('When playing a game', function() {

	var MAX_ROUNDS = 8;
	var FAKE_ANSWERS = 0;
	var roomId;
	var cardsToSubmit;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can submit an answer', function() {

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
		});

		expect(browser.getCurrentUrl()).toMatch(/\/wait/);

	});

	it('can refresh and stay on waiting page', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
	});

	it('can be redirected to a voting page once everyone submitted', function() {
		secondClonageUser.submitFirstAnswers(cardsToSubmit);
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);
	});

	it('can see what round we are on and how many are left', function() {
		expect(firstClonageUser.element(by.id('current-round')).getText()).toEqual('Round 1 / ' + MAX_ROUNDS);
		expect(secondClonageUser.element(by.id('current-round')).getText()).toEqual('Round 1 / ' + MAX_ROUNDS);
	});

	it('can see what everyone submitted', function() {
		expect(firstClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2 + FAKE_ANSWERS);
		expect(secondClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2 + FAKE_ANSWERS);
	});

	it('can refresh and see voting page again', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(firstClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2 + FAKE_ANSWERS);
	});

	it('can vote for an answer', function() {
		firstClonageUser.submitFirstVote();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
	});

	it('can refresh and stay on vote-wait page', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
		firstClonageUser.clearUser();
		browser2.close();
	});
});
