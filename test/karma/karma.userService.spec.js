describe("Testing User Service", function() {

	var mockStorageService = {

	};

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

	beforeEach(inject(function(_userService_) {
		userService = _userService_;
	}));

	it("submit choice calls communicationService", function() {
		spyOn(mockCommunicationService, 'sendMessage');
		userService.submitChoice({});
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

});
