var clonageUser = require("./helpers/browserHelper.js");

describe('When starting a game with BOTS', function() {

	var HAND_SIZE = 10;
	var BOT_NUM = 3;
	var MAX_ROUNDS = 8;
	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('Can start a game with bots', function() {
		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.setBotsOn(BOT_NUM); // ENABLE BOTS

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			secondClonageUser.joinRoom(roomId);
			firstClonageUser.ready();
		});
		secondClonageUser.ready();

		firstClonageUser.submitFirstAnswer();
		secondClonageUser.submitFirstAnswer();

		expect(browser.getCurrentUrl()).toMatch(/\/vote/);
		expect(browser2.getCurrentUrl()).toMatch(/\/vote/);
	});

	it('Can see your answers plus the bot answers', function() {
		expect(firstClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2 + BOT_NUM);
		expect(secondClonageUser.element.all(by.repeater("answer in answers()")).count()).toEqual(2 + BOT_NUM);
	});

	it('can vote for any answer', function() {
		firstClonageUser.submitFirstVote();
		expect(browser.getCurrentUrl()).toMatch(/\/wait/);

	});

	it('Taken to the resuls page after last person voted', function() {
		secondClonageUser.submitFirstVote();
		expect(browser2.getCurrentUrl()).toMatch(/\/results/);
		expect(browser.getCurrentUrl()).toMatch(/\/results/);
	});

	it('can see all the answers that were submitted', function() {
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).count()).toBe(2 + BOT_NUM);
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).count()).toBe(2 + BOT_NUM);
	});

	it('can finish a game with bots', function() {

		firstClonageUser.ready();
		secondClonageUser.ready();

		//change value here if we change the number of rounds
		for (var i = 0; i < MAX_ROUNDS - 1; i++) {
			console.log("round " + i);
			firstClonageUser.submitFirstAnswer();
			secondClonageUser.submitFirstAnswer();

			firstClonageUser.submitFirstVote();
			secondClonageUser.submitFirstVote();

			firstClonageUser.ready();
			secondClonageUser.ready();
		}

		expect(browser.getCurrentUrl()).toMatch(/\/endGame/);
		expect(browser2.getCurrentUrl()).toMatch(/\/endGame/);
	});

	it('can see players final scores', function() {
		expect(firstClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).count()).toBe(2 + BOT_NUM);
		expect(secondClonageUser.element.all(by.repeater('result in getPlayerRoundResults()')).count()).toBe(2 + BOT_NUM);
	});



});
