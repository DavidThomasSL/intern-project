ClonageApp.service('gameService', ['communicationService', function(communicationService) {

	/*--------------------
	//PUBLIC API
	 	These are functions exposed by the service to the outside work i.e controllers,
	    and others who who use this service
	//-------------------	*/

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var playerRoundResults = [];
	var currentscores = [];
	var voteCounter = 0;
	var maxRounds = 8; //variable holding the number of rounds wanted

	function getRoundQuestion() {
		return currentQuestion;
	}

	function getCurrentRound() {
		return round;
	}

	function startGame(roomId) {
		sendMessage("GAME start", {
			roomId: roomId
		});
	}

	//get all answers submitted
	function getAnswers() {
		return answers;
	}

	function getCurrentVotes() {
		return voteCounter;
	}

	//get results of voting
	function getPlayerRoundResults() {
		return playerRoundResults;
	}

	//get final scores after the game finished
	function getCurrentScores() {
		return currentscores;
	}

	//load next round or finish the game if that was the last round
	function nextRound(roomId) {
		if (round !== maxRounds) {
			round++;
			sendMessage("GAME next round", {
				roomId: roomId
			});
		} else {
			sendMessage("GAME finish", {
				roomId: roomId
			});
		}
	}

	//tell server to finish the game
	function finishGame(roomId) {
		sendMessage("GAME finish", {
			roomId: roomId
		});
	}

	/*
	---------------
	    COMMUNCATION LAYER API
	    These are functions called by the communcation
	    service when it recives a message for the user service
	---------------
	*/

	function recieveQuestion(data) {
		currentQuestion = data.question;
		round = data.round;
		currentscores = data.scores;
	}

	function setChosenAnswers(data) {
		answers = data.answers;
	}

	function setPlayerRoundResults(data) {
		playerRoundResults = data.results;
		voteCounter = data.voteNumber;
	}


	function gameFinish(data) {
		currentscores = data.results;
	}

	/*
    ---------------
        REGISTERING COMMUNCATION API WITH LAYER
        Must register the user service with the communcation service,
        and provide an api to call back when recieving an event
    ----------------
     */

	communicationService.registerListener("GAME", [{
		eventName: "question",
		eventAction: recieveQuestion
	}, {
		eventName: "chosenAnswers",
		eventAction: setChosenAnswers
	}, {
		eventName: "playerRoundResults",
		eventAction: setPlayerRoundResults
	}, {
		eventName: "finish",
		eventAction: gameFinish
	}]);

	/*
    -------------------
    INTERNAL HELPER FUNCTIONS
    -----------------
    */

	function sendMessage(eventName, data, callback) {
		if (callback === undefined) {
			callback = function() {};
		}
		communicationService.sendMessage(eventName, data, callback);
	}

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getPlayerRoundResults: getPlayerRoundResults,
		getCurrentScores: getCurrentScores,
		nextRound: nextRound,
		finishGame: finishGame,
		getCurrentVotes: getCurrentVotes
	};

}]);
