describe("Testing Routing Service ", function() {

	var mockCommunicationService = {
		registerListener: function(name, events) {
			this.name = name;
			this.events = events;
		},
		sendMessage: function() {}
	};

	var mockLocationService = {
		path: function(route) {
			console.log(route);
		}
	};

	beforeEach(function() {
		angular.module('btford.socket-io', []);
		module('ClonageApp');
	});

	beforeEach(module(function($provide) {
		$provide.value('communicationService', mockCommunicationService);
		$provide.value('$location', mockLocationService);
	}));

	beforeEach(inject(function(_RoutingService_) {
		routingService = _RoutingService_;
	}));

	it("is defined", function() {
		expect(routingService).toBeDefined();
	});

	it("registers with the communicationService", function() {
		expect(mockCommunicationService.name).toEqual("ROUTING");
		expect(mockCommunicationService.events[0]).toEqual({eventName: "", eventAction: jasmine.any(Function)});
	});

	it("changes the path variable to /room when called with room _handleRouting", function() {
		spyOn(mockLocationService, "path");

		routingService._handleRouting({location: "room"});

		expect(mockLocationService.path).toHaveBeenCalledWith("/room");
	});

	it("changes the path variable to /joining when called with joining _handleRouting", function() {
		spyOn(mockLocationService, "path");

		routingService._handleRouting({location: "joining"});

		expect(mockLocationService.path).toHaveBeenCalledWith("/joining");
	});

	it("changes the path variable to /question when called with question _handleRouting", function() {
		spyOn(mockLocationService, "path");

		routingService._handleRouting({location: "question"});

		expect(mockLocationService.path).toHaveBeenCalledWith("/question");
	});
});
