describe("Testing Room Service", function() {

	var mockCommunicationService = {
		registerListener: function(name, events) {
			this.name = name;
			this.events = events;
		},
		sendMessage: function() {}
	};

	beforeEach(function() {
		angular.module('btford.socket-io', []);
		module('ClonageApp');
	});

	beforeEach(module(function($provide) {
		$provide.value('communicationService', mockCommunicationService);
	}));

	beforeEach(inject(function(_roomService_) {
		roomService = _roomService_;
	}));

	it("Should be defined", function() {
		expect(roomService).toBeDefined();
	});

	it("registers itself with the communicationService on startup", function() {
		expect(mockCommunicationService.name).toEqual("ROOM");
		expect(mockCommunicationService.events[0]).toEqual({
			eventName: 'details',
			eventAction: jasmine.any(Function)
		});
	});

	it("createRoom should send a message to communicationService", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		roomService.createRoom(1);

		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("joinRoom should send a message to communicationService", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		roomService.joinRoom(1);

		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("joinRoom should send a message to communicationService", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		roomService.leaveRoom();

		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("can set room details from _setRoomDetails and retrieve usersInRoom ", function() {
		var usersInRoom = [{
			name: "Tim",
			id: 1
		}, {
			name: "Bob",
			id: 3
		}];

		roomService._setRoomDetails({
			roomId: "ABCDE",
			botsEnabled: false,
			usersInRoom: usersInRoom,
			gameInProgress: false
		});

		expect(roomService.getUsersInRoom()).toEqual(usersInRoom);

	});

	it("can set messages from _setMessages and retrieve messages from getMessages() ", function() {
		var messages = [{
			playerName: "Bob",
            playerUid: 1,
            messageText: "Hi!"
		}, {
			playerName: "Kevin",
            playerUid: 2,
            messageText: "How are you?"
		}];

		roomService._setMessages(messages);

		expect(roomService.getMessages()).toEqual(messages);

	});

	it("can set room details from _setRoomDetails and retrieve roomId ", function() {
		roomService._setRoomDetails({
			roomId: "ABCDE",
			usersInRoom: [1],
			gameInProgress: false,
			botsEnabled: false
		});

		expect(roomService.getRoomId()).toEqual("ABCDE");

	});

});
