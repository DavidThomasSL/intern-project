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

	    it('should create $scope.counter when calling startCountdown', function() {
		        expect(scope.counter).toBeUndefined();
		        scope.startCountdown();
		        expect(scope.counter).toBeDefined();
		});

		it("when it starts, countdown should be initialised with 60 if getCountdown is undefined", function() {

			var spyEvent = spyOn(gameService, 'getCountdown');
			scope.startCountdown();
			expect(spyEvent).toHaveBeenCalled();
			expect(scope.counter).toBe(60);

		});

		it("when it starts, countdown can get value from server", function() {
			angular.mock.inject(function (_$interval_) {
	            $interval = _$interval_;
	        });

			gameService._receiveQuestion({
				question: "test question?",
				round: 1,
				countdown: 2
			});

			scope.startCountdown();
		    expect(gameService.getCountdown()).toEqual(2);
		    $interval.flush(1000);
			expect(scope.counter).toBe(1);
		});

		it("when countdown gets to 0, stopCountdown should be called", function() {
			angular.mock.inject(function (_$interval_) {
	            $interval = _$interval_;
	        });

			gameService._receiveQuestion({
				question: "test question?",
				round: 1,
				countdown: 2
			});

			var spyEvent = spyOn(scope, 'stopCountdown');

			scope.startCountdown();
		    $interval.flush(6000);

			expect(spyEvent).toHaveBeenCalled();
		});

	});

});