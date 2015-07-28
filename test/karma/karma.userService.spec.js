describe("Testing User Service", function() {

	var mockStorageService = {
		userID: undefined
	};

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

	var testUser = {
		uId: 1,
		name: "bob",
		roomId: "B00B5"
	};

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

	it("can set userDetails with internal function from communicationService", function() {
		userService._setUserDetails({
			user: testUser
		});
	});

	it("submitChoice calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		userService._setUserDetails({
			user: testUser
		});
		userService.submitChoice("answer");

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER submitChoice", {
			playerId: 1,
			playerName: "bob",
			answer: 'answer',
			roomId: "B00B5"
		}, jasmine.any(Function));
	});

	it("submitVote calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		userService._setUserDetails({
			user: testUser
		});
		userService.submitVote("answer");

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER vote", {
			playerId: 1,
			playerName: "bob",
			answer: 'answer',
			roomId: "B00B5"
		}, jasmine.any(Function));
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
