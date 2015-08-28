var clonageUser = require("./helpers/browserHelper.js");

describe('When creating a room', function() {

	var firstClonageUser = new clonageUser(browser);

	it('user can create a new room and are automatically put into it', function() {

		firstClonageUser.getIndex();
		expect(browser.getCurrentUrl()).toMatch(/\//);
		firstClonageUser.submitName('Tom');
		firstClonageUser.createRoom();

		expect(element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/room/);

	});

	it('users in a lobby can see the room code', function() {

		expect(browser.getCurrentUrl()).toMatch(/\/room/);
		expect(firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			return roomId.length;
		})).toBe(4);

	});

	it('number of rounds should be visable and default to 8', function() {
		expect(element(by.binding("getGameParameters().numRounds")).getText()).toMatch("1 Rounds");

	});

	it("users can't start a game by themselves and no bots or other players", function() {
		expect(element(by.id("ready-button")).getAttribute('disabled')).toEqual('true');
		firstClonageUser.ready();
		expect(browser.getCurrentUrl()).toMatch(/\/room/);
	});

	it('users can change the number of bots in the room and that update on the page', function() {
		firstClonageUser.setBotsOn(3);
		expect(element(by.binding("getGameParameters().botNumber")).getText()).toMatch("3 Bots");
		expect(firstClonageUser.element.all(by.repeater('user in getBotsInRoom()')).count()).toBe(3);

	});


	it('users can change the number of rounds in the room and updates on their page', function() {
		firstClonageUser.setRoundNumber(8);
		expect(element(by.binding("getGameParameters().numRounds")).getText()).toMatch("8 Rounds");
	});

	it('users can change the number of rounds and bots and stay on refresh', function() {
		firstClonageUser.setRoundNumber(2);
		firstClonageUser.setBotsOn(6);

		firstClonageUser.refresh();

		expect(element(by.binding("getGameParameters().numRounds")).getText()).toMatch("2 Rounds");
		expect(element(by.binding("getGameParameters().botNumber")).getText()).toMatch("6 Bots");
		expect(firstClonageUser.element.all(by.repeater('user in getBotsInRoom()')).count()).toBe(6);

	});

	it("users can start a game by themselves if there are bots in the game", function() {
		firstClonageUser.setBotsOn(3);
		expect(element(by.id("ready-button")).getAttribute('disabled')).toEqual(null); // No disabled attribute at this point
	});

	it('user can see themselves in the room', function() {

		expect(browser.getCurrentUrl()).toMatch(/\/room/);
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(element.all(by.repeater('user in getActiveUsersInRoom()')).get(0).getText()).toBe('Tom');

	});

	it('on refresh the user is put back in the room lobby', function() {

		firstClonageUser.refresh();
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/room/);

		firstClonageUser.clearUser();
	});

});
