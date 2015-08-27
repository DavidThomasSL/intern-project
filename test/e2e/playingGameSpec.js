var clonageUser = require("./helpers/browserHelper.js");

///<reference path="../../Scripts/angular-mocks.js"/>

describe('When playing a game', function() {

	var HAND_SIZE = 10;
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

	it('can see who submitted an answer', function() {
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
	});

	it('can see who did not submit an answer yet', function() {
		expect(firstClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
	});

	it('can replace unwanted cards in hand and points are reduced as a result', function() {

		secondClonageUser.replaceHand();
		for(i=0; i<HAND_SIZE; i++){
			expect(secondClonageUser.element.all(by.exactRepeater("answer in userHand()")).get(i).element(by.id("answer")).getText()).not.toMatch(currentHand[i]);
		}
	});

	it('can refresh and still see who submitted an answer', function() {
		firstClonageUser.refresh();
		secondClonageUser.refresh();
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
	});

	it('can refresh and still see who did not submit an answer yet', function() {
		firstClonageUser.refresh();
		secondClonageUser.refresh();
		expect(firstClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
	});

	it('can refresh and stay on waiting page', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
	});

	it('can see a timer', function() {
		var timer = firstClonageUser.element(by.id('countdown'));
		expect(timer.isPresent()).toBe(true);
	});

	it('can have a counter that indicates number of seconds left', function() {
		var counter = firstClonageUser.element(by.binding('counter'));
		expect(counter.isPresent()).toBeLessThan(61);
	});

	it('can be redirected to a voting page once everyone submitted', function() {
		secondClonageUser.submitFirstAnswers(cardsToSubmit);
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);
	});

	it('can see what round we are on and how many are left', function() {

		MAX_ROUNDS = 8;

		expect(firstClonageUser.element(by.id('current-round')).getText()).toEqual('Round 1 / ' + MAX_ROUNDS);
		expect(secondClonageUser.element(by.id('current-round')).getText()).toEqual('Round 1 / ' + MAX_ROUNDS);
	});

	it('can see what everyone submitted', function() {
		expect(firstClonageUser.element.all(by.repeater("answer in visualiseAnswers()")).count()).toEqual(2);
		expect(secondClonageUser.element.all(by.repeater("answer in visualiseAnswers()")).count()).toEqual(2);
	});

	it('can refresh and see voting page again', function () {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(firstClonageUser.element.all(by.repeater("answer in visualiseAnswers()")).count()).toEqual(2);

	});

	it('can vote for an answer', function() {
		firstClonageUser.submitFirstVote();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
	});

	it('can see who voted for an answer', function() {
		expect(firstClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-submitted');
	});

	it('can see who did not vote for an answer yet', function() {
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-not-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-not-submitted');
	});

	it('can refresh and still see who voted for an answer', function() {
		firstClonageUser.refresh();
		secondClonageUser.refresh();
		expect(firstClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).first().getAttribute('class')).toMatch('player-submitted');
	});

	it('can refresh and still see who did not vote for an answer yet', function() {
		firstClonageUser.refresh();
		secondClonageUser.refresh();
		expect(firstClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
		expect(secondClonageUser.element.all(by.id('user-panel')).last().getAttribute('class')).toMatch('player-not-submitted');
	});

	it('can refresh and stay on vote-wait page', function() {
		firstClonageUser.refresh();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);
		firstClonageUser.clearUser();
		browser2.close();
	});
});
