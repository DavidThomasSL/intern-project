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


	});

});