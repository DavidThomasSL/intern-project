describe("Testing Player Service", function() {

	var mockCommunicationService = {
		registerListener: function(name, events) {
			this.name = name;
			this.events = events;
		},
		sendMessage: function() {}
	};

	var mockDynamicTextService = {
		getSubmissionState: function(currentQuestion, enteredAnswer, currentlySubmittedAnswers) {

			currentlySubmittedAnswers.push(enteredAnswer);
			var readyToSend = false;

			if(currentlySubmittedAnswers.length === 2){
				readyToSend = true;
			}

			return{
				currentlySubmittedAnswers: currentlySubmittedAnswers,
				currentFilledInQuestion: currentQuestion,
				readyToSend: readyToSend
			};
		}
	};

	beforeEach(function() {
		angular.module('btford.socket-io', []);
		module('ClonageApp');
	});

	beforeEach(module(function($provide) {
		$provide.value('communicationService', mockCommunicationService);
		$provide.value('dynamicTextService', mockDynamicTextService);
	}));

	beforeEach(inject(function(_playerService_) {
		playerService = _playerService_;
	}));

	it("Registers itself with the communicationService", function() {
		expect(mockCommunicationService.name).toEqual("PLAYER");
		expect(mockCommunicationService.events[0]).toEqual({
			eventName: 'question',
			eventAction: jasmine.any(Function)
		});
	});

	it("readying up calls send message", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		playerService.sendReadyStatus(1);
		expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
	});

	it("submitChoice calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		playerService._receiveQuestion({
			question: {
				text: "test question?",
				pick: 2
			},
			round: 1
		});

		playerService.submitChoice("answer1");
		playerService.submitChoice("answer2");

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("PLAYER submitChoice", {
			answer: ["answer1", "answer2"],
		}, jasmine.any(Function));
	});

	it("submitVote calls communicationService with correct data", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		playerService.submitVote(["answer1", "answer2"]);

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("PLAYER vote", {
			answer: ["answer1", "answer2"],
		}, jasmine.any(Function));
	});

	it("replaceCardsSelect doesn't call communicationService if cards no cards are selected", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		playerService.replaceCardsSubmit();

		expect(mockCommunicationService.sendMessage.calls.any()).toEqual(false);
	});


	it("replaceCardsSelect calls communicationService with correct data if cards are selected", function() {
		spyOn(mockCommunicationService, 'sendMessage');

		playerService.replaceCardsSelect("answer1");
		playerService.replaceCardsSelect("answer2");
		playerService.replaceCardsSubmit();

		expect(mockCommunicationService.sendMessage).toHaveBeenCalledWith("PLAYER replace cards", {
			cardsToReplace: ["answer1", "answer2"],
		}, jasmine.any(Function));
	});


});
