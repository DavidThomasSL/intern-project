var clonageUser = require("./helpers/browserHelper.js");


describe('When joining an existing room', function() {

	var roomId;

	var browser2 = browser.forkNewDriverInstance(false, true);

	var firstClonageUser = new clonageUser(browser);
	var secondClonageUser = new clonageUser(browser2);

	it('can join an existing room and go into the lobby and see other users in the room', function() {

		firstClonageUser.getIndex();
		firstClonageUser.submitName('John');
		firstClonageUser.createRoom();

		secondClonageUser.getIndex();
		secondClonageUser.submitName('Alice');

		firstClonageUser.getRoomId().then(function(text) {
			roomId = text.split(" ")[2];
			secondClonageUser.joinRoom(roomId);
		});

		expect(browser2.getCurrentUrl()).toMatch(/\/room/);
		expect(secondClonageUser.element(by.id('room-join-container')).isPresent()).toBe(false);
		expect(secondClonageUser.element(by.id('room-lobby-container')).isPresent()).toBe(true);

		expect(secondClonageUser.element.all(by.repeater('user in getUsersInRoom()')).get(0).getText()).toBe('John');
		expect(secondClonageUser.element.all(by.repeater('user in getUsersInRoom()')).get(1).getText()).toBe('Alice');

	});

	it('if a user leaves the lobby the other user can see that without updating', function() {

		secondClonageUser.leaveLobby();
		expect(firstClonageUser.element.all(by.repeater('user in getUsersInRoom()')).count()).toBe(1);

	});

	it('if other user joins room, user in room can see that without updating', function() {

		secondClonageUser.joinRoom(roomId);
		expect(firstClonageUser.element.all(by.repeater('user in getUsersInRoom()')).count()).toBe(2);

		firstClonageUser.clearUser();
		browser2.close();
	});
});