describe("Testing Main Controller", function() {

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

    describe('MainController', function() {
	    beforeEach(inject(function($rootScope, $controller) {
	      	scope = $rootScope.$new();
	      	controller = $controller('MainController', {
		        '$scope': scope,
		        'gameService': gameService
		    });
	    }));

	    it('should create $scope.counter when calling startCountdown',
		    function() {
		        expect(scope.counter).toBeUndefined();
		        scope.startCountdown();
		        expect(scope.counter).toBeDefined();
		});

		it("when it starts, countdown should be initialised with 30 when getCountdown is undefined", function() {

			var spyEvent = spyOn(gameService, 'getCountdown');
			scope.startCountdown();
			expect(spyEvent).toHaveBeenCalled();
			expect(scope.counter).toBe(30);

			// spyOn(scope, 'stopCountdown');
			// expect(scope.stopCountdown).toHaveBeenCalled();
		});

		// it("when it starts, countdown can get value from server", function() {

		// 	//set the round question
		// 	gameService._receiveQuestion({
		// 		question: "test question?",
		// 		round: 1,
		// 		countdown: 2
		// 	});
		// 	var spyEvent = spyOn(gameService, 'getCountdown');
		// 	scope.startCountdown();
		// 	expect(spyEvent).toHaveBeenCalled();
		// 	expect(scope.counter).toBe(1);

		// 	// spyOn(scope, 'stopCountdown');
		// 	// expect(scope.stopCountdown).toHaveBeenCalled();
		// });

		// it("when countdown gets to 0, stopCountdown should be called", function() {

		// 	//set the round question
		// 	gameService._receiveQuestion({
		// 		question: "test question?",
		// 		round: 1,
		// 		countdown: 2
		// 	});
		// 	var spyEvent = spyOn(gameService, 'getCountdown');
		// 	scope.startCountdown();
		// 	expect(spyEvent).toHaveBeenCalled();
		// 	expect(scope.counter).toBe(1);

		// 	// spyOn(scope, 'stopCountdown');
		// 	// expect(scope.stopCountdown).toHaveBeenCalled();
		// });

		// it("after stopCountdown is called, countdown should be undefined", function() {
		// 	//set the round question
		// 	gameService._receiveQuestion({
		// 		question: "test question?",
		// 		round: 1,
		// 		countdown: 2
		// 	});
		// 	expect(gameService.getCountdown()).toEqual(2);
		// });

	});

});