describe("Testing Communcation Service ", function() {

	// var onSpy

	var mockSocketService = {
		on: function(eventName, callback) {
			if (!this.eventNames) {
				this.eventNames = [];
				this.eventActions = [];
			}
			this.eventNames.push(eventName);
			this.eventActions.push(callback);
		},
		emit: function(eventName, data) {},
	};

	beforeEach(function() {
		angular.module('btford.socket-io', []);
		module('ClonageApp');

	});

	beforeEach(module(function($provide) {
		$provide.value('socket', mockSocketService);
		spyOn(mockSocketService, 'on').and.callThrough();

	}));

	beforeEach(inject(function(_communicationService_) {
		communicationService = _communicationService_;
	}));

	it("registers socket event listeners on creation", function() {

		expect(mockSocketService.on).toHaveBeenCalled();
		expect(mockSocketService.eventNames).toEqual(["connect",
			"USER details",
			"USER room join",
			"USER hand",
			"GAME question",
			"GAME timeout",
			"USER play again",
			"GAME roundSubmissionData",
			"GAME finish",
			"GAME rooms available",
			"ROOM details",
			"ROOM messages",
			"ROUTING",
			"NOTIFICATION message",
			"NOTIFICATION actionable",
			"PLAYER question"
		]);
	});

	it("can send a message over a socket with the correct message", function() {

		var data = {
			data: [1, 2, 3],
			name: "another"
		};

		// console.log(mockSocketService);
		spyOn(mockSocketService, 'emit');

		communicationService.sendMessage("TEST test", data, function() {});

		expect(mockSocketService.emit).toHaveBeenCalledWith('TEST test', data);
	});

	it("can send a message over a socket and the callback fires correctly", function() {

		var data = {
			data: [1, 2, 3],
			name: "another"
		};

		var observer = {
			callback: function() {}
		};

		spyOn(observer, 'callback');

		communicationService.sendMessage("TEST test", data, observer.callback);

		expect(observer.callback).toHaveBeenCalled();
	});

	it("registers a service correctly", function() {

		var mockService = {
			name: "MOCK",
			listenerCallbacks: [{
				eventName: "TEST1",
				eventAction: function() {}
			}, {
				eventName: "TEST2",
				eventAction: function() {}
			}]
		};

		communicationService.registerListener(mockService.name, mockService.listenerCallbacks);

		expect(communicationService._getListenerList()).toEqual([{
			listenerCallbacks: mockService.listenerCallbacks,
			name: "MOCK"
		}]);
	});

	it("will set the right listener callback if receives an event from the socket", function() {

		var mockCallback = {
			callback: function() {return "I was called";}
		};

		var mockService = {
			name: "MOCK",
			listenerCallbacks: [{
				eventName: "test1",
				eventAction: mockCallback.callback
			}, {
				eventName: "test2",
				eventAction: mockCallback.callback
			}]
		};

		spyOn(mockCallback, 'callback');

		communicationService.registerListener(mockService.name, mockService.listenerCallbacks);
		communicationService._setListenerEventAction("MOCK test1");
		var func = communicationService._getOnMessageFunction();

		expect(func()).toEqual("I was called");

	});



});
