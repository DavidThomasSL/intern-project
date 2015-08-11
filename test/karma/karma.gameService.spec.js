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

	it("readying up calls send message", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.sendReadyStatus(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("submitChoice calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService._receiveQuestion({
			question: {
				text: "test question?",
				pick: 2
			},
			round: 1
		});

		gameService.submitChoice("answer1");
		gameService.submitChoice("answer2");

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER submitChoice", {
			answer: ["answer1", "answer2"],
		}, jasmine.any(Function));
	});

	it("submitVote calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		gameService.submitVote(["answer1", "answer2"]);

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("USER vote", {
			answer: ["answer1", "answer2"],
		}, jasmine.any(Function));
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

		listenerEvent({
			question: "",
			round: 5
		});
		expect(gameService.getCurrentRound()).toBe(5);
	});



});