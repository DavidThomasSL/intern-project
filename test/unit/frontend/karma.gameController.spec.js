describe("Testing Game Controller", function() {

	var scope, controller;

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

	beforeEach(inject(function(_roomService_) {
		roomService = _roomService_;
	}));

	beforeEach(inject(function(_playerService_) {
		playerService = _playerService_;
	}));

	describe('GameController', function() {
		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			controller = $controller('gameController', {
				'$scope': scope,
				'gameService': gameService,
				'roomService': roomService,
				'playerService': playerService
			});
		}));

		it("when visualiseAnswers is triggered, gameService.getAnswers should be called", function() {
			var spyEvent = spyOn(gameService, 'getAnswersToVisualise').and.callThrough();


			var roundSubmissionsDataObject = {
				roundSubmissionData: [{
					submissionsText: ['one', 'two']
				}, {
					submissionsText: ['three', 'four']
				}],
				currentNumberOfVotes: 0,
				currentNumberOfSubmission: 2
			};

			gameService._setRoundSubmissionData(roundSubmissionsDataObject);

			scope.visualiseAnswers();
			expect(spyEvent).toHaveBeenCalled();

		});

		it("if timer hasn't started, visualiseAnswers should return the first answer", function() {


			var roundSubmissionsDataObject = {
				roundSubmissionData: [{
					submissionsText: ['one', 'two']
				}],
				currentNumberOfVotes: 0,
				currentNumberOfSubmission: 1
			};

			gameService._setRoundSubmissionData(roundSubmissionsDataObject);

			var answer = scope.visualiseAnswers();
			expect(answer).toEqual([{
				submissionsText: ['one', 'two']
			}]);

		});

		it("when play again is trigered roomService.createRoom is triggered", function() {

			var spyEvent = spyOn(roomService, 'createRoom').and.callThrough();
			scope.playAgain();
			expect(spyEvent).toHaveBeenCalled();

		});

		it("when play again is trigered playerService.playAgain is called", function() {

			var spyEvent = spyOn(playerService, 'playAgain').and.callThrough();
			scope.playAgain();
			expect(spyEvent).toHaveBeenCalled();

		});

		it("timer should increase scope.index", function() {

			angular.mock.inject(function(_$timeout_) {
				$timeout = _$timeout_;
			});
			expect(scope.index).toEqual(0);
			scope.startTimer();
			$timeout.flush();
			expect(scope.index).toEqual(1);

		});

		it("when index points to the last element, timer should be stopped", function() {

			var spyEvent = spyOn(scope, 'stopTimer').and.callThrough();
			angular.mock.inject(function(_$timeout_) {
				$timeout = _$timeout_;
			});

			var roundSubmissionsDataObject = {
				roundSubmissionData: [{
					submissionsText: ['one', 'two']
				}, {
					submissionsText: ['three', 'four']
				}],
				currentNumberOfVotes: 0,
				currentNumberOfSubmission: 2
			};

			gameService._setRoundSubmissionData(roundSubmissionsDataObject);

			scope.startTimer();
			$timeout.flush();

			scope.startTimer();
			$timeout.flush();

			scope.startTimer();
			$timeout.flush();

			scope.visualiseAnswers();

			expect(spyEvent).toHaveBeenCalled();

		});

		it("when the animation stops, we should see all answers", function() {

			angular.mock.inject(function(_$timeout_) {
				$timeout = _$timeout_;
			});

			var roundSubmissionsDataObject = {
				roundSubmissionData: [{
					submissionsText: ['one', 'two']
				}, {
					submissionsText: ['three', 'four']
				}],
				currentNumberOfVotes: 0,
				currentNumberOfSubmission: 2
			};

			gameService._setRoundSubmissionData(roundSubmissionsDataObject);

			scope.startTimer();
			$timeout.flush();

			scope.startTimer();
			$timeout.flush();

			scope.startTimer();
			$timeout.flush();

			var answers = scope.visualiseAnswers();
			expect(answers).toEqual([{
				submissionsText: ['one', 'two']
			}, {
				submissionsText: ['three', 'four']
			}]);

		});

	});

});