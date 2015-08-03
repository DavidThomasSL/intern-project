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
		expect(mockCommunicationService.events[0]).toEqual({eventName: 'question', eventAction: jasmine.any(Function)});
	});

	it("readying up calls send message", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.sendReadyStatus(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("getRoundQuestion gets question", function() {
		//set the round question
		gameService._recieveQuestion({
			question: "test question?",
			round: 1
		});
		expect(gameService.getRoundQuestion()).toEqual("test question?");
	});

	it("getRoundQuestion gets round", function() {
		//set the round question
		gameService._recieveQuestion({
			question: "test question?",
			round: 1
		});
		expect(gameService.getCurrentRound()).toEqual(1);
	});

	it("getAnswers gets answers", function() {
		//set the round question
		gameService._setChosenAnswers({
			answers: "test answer"
		});
		expect(gameService.getAnswers()).toEqual("test answer");
	});

	it("getCurrentVotes gets vote number", function() {
		//set the round question
		gameService._setPlayerRoundResults({
			results: "results",
			voteNumber: 2
		});
		expect(gameService.getCurrentVotes()).toEqual(2);
	});

	it("communicationService can call events in the Game Service", function() {

		var listenerEvent;

		mockCommunicationService.events.forEach(function(event) {
			if (event.eventName === "question") {
				listenerEvent = event.eventAction;
			}
		});

		listenerEvent({question: "", round: 5});
		expect(gameService.getCurrentRound()).toBe(5);
	});

});
