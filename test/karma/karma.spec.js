describe('example test', function() {
	it('should be true', function() {
		expect('foo').toBe('foo');
	});
});

describe('Unit: MainController', function() {

	var app;

	beforeEach(function() {
		app = angular.module('ClonageApp');
	});

	it("should be real", function() {
		expect(app).not.toBeNull();
	});
});

describe("Testing Game Service", function() {

	var mockCommunicationService = {
		registerListener: function() {},
		sendMessage: function() {}
	};

	beforeEach(function() {
		angular.module('ngAnimate', []);
		angular.module('btford.socket-io', []);
		module('ClonageApp');
	});

	beforeEach(module(function($provide) {
		$provide.value('communicationService', mockCommunicationService);
	}));

	beforeEach(inject(function(_gameService_) {
		gameService = _gameService_;
	}));

	it("start game calls send message", function() {
		spyOn(mockCommunicationService, 'sendMessage');
		gameService.startGame(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});



});
