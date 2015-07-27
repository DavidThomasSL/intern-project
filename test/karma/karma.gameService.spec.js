// describe('Unit: MainController', function() {

// 	var app;

// 	beforeEach(function() {
// 		app = angular.module('ClonageApp');
// 	});

// 	it("should be real", function() {
// 		expect(app).not.toBeNull();
// 	});
// });

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

	it("start game calls send message", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.startGame(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("next round calls send message when more rounds left", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.nextRound(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("next round calls send message when no rounds left", function() {
		gameService._setMaxRounds(2);
		gameService._recieveQuestion({
			question: "",
			round: 10
		});

		spyOn(mockCommunicationService, 'sendMessage');
		gameService.nextRound(5);
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

	it("getFinalResults gets final results", function() {
		//set the round question
		gameService._gameFinish({
			results: "results"
		});
		expect(gameService.getFinalResults()).toEqual("results");
	});

	it("finishGame calls send message when no rounds left", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.finishGame(5);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("Registers itself with the communicationService", function() {
		expect(mockCommunicationService.events).not.toBeNull();
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
