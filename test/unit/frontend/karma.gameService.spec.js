describe("Testing Game Service", function() {

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

	beforeEach(inject(function(_gameService_) {
		gameService = _gameService_;
	}));

	it("Registers itself with the communicationService", function() {
		expect(mockCommunicationService.name).toEqual("GAME");
		expect(mockCommunicationService.events[0]).toEqual({
			eventName: 'question',
			eventAction: jasmine.any(Function)
		});
	});

	it("getRoundQuestion gets question", function() {
		//set the round question
		gameService._receiveQuestion({
			question: {
				text: "test question?",
				pick: 1
			},
			round: 1
		});
		expect(gameService.getCurrentQuestion().text).toEqual("test question?");
	});

	it("getRoundQuestion gets round", function() {
		//set the round question
		gameService._receiveQuestion({
			question: {
				text: "test question?",
				pick: 1
			},
			round: 1
		});
		expect(gameService.getCurrentRound()).toEqual(1);
	});

	it("getRoundQuestion gets blanks", function() {
		//set the round question
		gameService._receiveQuestion({
			question: {
				text: "test question?",
				pick: 1
			},
			round: 1
		});
		expect(gameService.getCurrentQuestion().pick).toEqual(1);
	});

	it("getCountdown gets countdown seconds left", function() {
		//set the round question
		gameService._receiveQuestion({
			question: "test question?",
			round: 1,
			countdown: 2
		});
		expect(gameService.getCountdown()).toEqual(2);
	});

	it("setCountdown sets countdown seconds left", function() {
		//set the round question
		gameService.setCountdown(2);
		expect(gameService.getCountdown()).toEqual(2);
	});

	it("communicationService can call events in the Game Service", function() {

		var listenerEvent;

		mockCommunicationService.events.forEach(function(event) {
			if (event.eventName === "question") {
				listenerEvent = event.eventAction;
			}
		});

		listenerEvent({
			question: "",
			round: 5
		});
		expect(gameService.getCurrentRound()).toBe(5);
	});



});
