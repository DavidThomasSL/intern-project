describe("Testing Game Controller", function() {

	var scope, controller ;

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

    describe('GameController', function() {
	    beforeEach(inject(function($rootScope, $controller) {
	      	scope = $rootScope.$new();
	      	controller = $controller('gameController', {
		        '$scope': scope,
		        'gameService': gameService
		    });
	    }));

	    it("when visualiseAnswers is triggered, gameService.getAnswers should be called", function() {
			var spyEvent = spyOn(gameService, 'getAnswers').and.callThrough();

	    	gameService._setChosenAnswers({
				answers: ["test answer", "another test answer"]
			});

			scope.visualiseAnswers();
			expect(spyEvent).toHaveBeenCalled();

		});

	    it("if timer hasn't started, visualiseAnswers should return the first answer", function() {

	    	gameService._setChosenAnswers({
				answers: ["test answer", "another test answer"]
			});
	    	var answer = scope.visualiseAnswers();
			expect(answer).toEqual(["test answer"]);

		});

		it("timer should increase scope.index", function() {

			angular.mock.inject(function (_$timeout_) {
	            $timeout = _$timeout_;
	        });
			expect(scope.index).toEqual(0);
	        scope.startTimer();
		    $timeout.flush();
			expect(scope.index).toEqual(1);

		});

		it("when index points to the last element, timer should be stopped", function() {

			var spyEvent = spyOn(scope, 'stopTimer').and.callThrough();
			angular.mock.inject(function (_$timeout_) {
	            $timeout = _$timeout_;
	        });

	        gameService._setChosenAnswers({
				answers: ["test answer", "another test answer"]
			});

			scope.startTimer();
		    $timeout.flush();

		    scope.startTimer();
		    $timeout.flush();

		    scope.startTimer();
		    $timeout.flush();

		    scope.visualiseAnswers();

			expect(spyEvent).toHaveBeenCalled();

		});

	});

});