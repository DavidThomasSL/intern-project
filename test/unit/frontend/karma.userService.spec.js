describe("Testing User Service", function() {

	var mockStorageService = {};

	var messageSent;

	var mockCommunicationService = {
		registerListener: function(name, events) {
			this.name = name;
			this.events = events;
		},
		sendMessage: function(msg) {
			console.log("msg");
			messageSent = msg;
		}
	};

	var testUser;

	beforeEach(function() {
		angular.module('btford.socket-io', []);
		module('ClonageApp');
	});

	beforeEach(module(function($provide) {
		$provide.value('communicationService', mockCommunicationService);
		$provide.value('$sessionStorage', mockStorageService);
	}));

	beforeEach(inject(function(_userService_) {
		userService = _userService_;
	}));

	beforeEach(function() {
		//reset the user object for each test, otherwise he mutates over time as the userService added data to the user object
		testUser = {
			uId: 1,
			name: "bob"
		};
	});

	it("Should be defined", function() {
		expect(userService).toBeDefined();
	});

	it("Registers itself with the communicationService", function() {
		expect(mockCommunicationService.name).toEqual("USER");
		expect(mockCommunicationService.events[0]).toEqual({eventName: 'connect', eventAction: jasmine.any(Function)});
	});

	it("register user sends a message to the communicationService with no userId if not set", function() {
		spyOn(mockCommunicationService, 'sendMessage');
		userService._registerUser();

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER register", {
			token: undefined
		}, jasmine.any(Function));
	});

	it("register user sends a message to the communicationService with userId if has been set in storage", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		mockStorageService.userId = 1;

		userService._registerUser();

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER register", {
			token: 1
		}, jasmine.any(Function));
	});

	it("submit message sends a message to the communicationService with userId, userName, messageText and roomId", function() {

		spyOn(mockCommunicationService, 'sendMessage');

		userService._setUserDetails({
			user: testUser
		});

		userService._joinRoom({
			roomId: "B00B5"
		});

		userService.sendMessage("Hi!");

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER send message", {
			playerName: "bob",
			playerUid: 1,
			messageText: "Hi!",
			roomId: "B00B5"
		}, jasmine.any(Function));
	});

	it("can set userDetails in session storage with internal function _setUserDetails from communicationService, ", function() {

		userService._setUserDetails({
			user: testUser
		});

		expect(mockStorageService.userId).toEqual(1);
	});

	it("can set roomId in session storage with internal function _joinRoom", function() {

		userService._joinRoom({
			roomId: "B00B5"
		});

		expect(mockStorageService.roomId).toBe("B00B5");
	});

	it("setName calls communicationService", function() {
		spyOn(mockCommunicationService, 'sendMessage');
		userService.setName({});
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("getUserName returns user's name", function() {
		userService._setUserDetails({
			user: testUser
		});
		expect(userService.getUserName()).toBe("bob");
	});

	it("getUserID returns user's id", function() {
		userService._setUserDetails({
			user: testUser
		});
		expect(userService.getUserId()).toBe(1);
	});

	it("getUserHand returns a user's current hand of cards", function() {
		userService._setHand({
			hand: [1, 2, 3]
		});
		expect(userService.getUserHand()).toEqual([1, 2, 3]);
	});

});
