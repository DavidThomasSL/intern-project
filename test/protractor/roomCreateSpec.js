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

	it('users can change the number of bots in the room and that update on the page', function() {
		firstClonageUser.setBotsOn(3);
		expect(element(by.binding("getBotNumber()")).getText()).toMatch("(3 addition users = 3x the fun!)");
	});

	it('user can see themselves in the room', function() {

		expect(browser.getCurrentUrl()).toMatch(/\/room/);
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(element.all(by.repeater('user in getUsersInRoom()')).get(0).getText()).toBe('Tom');

	});

	it('on refresh the user is put back in the room lobby', function() {

		firstClonageUser.refresh();
		expect(element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(element(by.id('room-lobby-container')).isPresent()).toBe(true);
		expect(browser.getCurrentUrl()).toMatch(/\/room/);

		firstClonageUser.clearUser();
	});

});
