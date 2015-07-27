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
	var finalresults = [];
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
		console.log(answers);
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
	function getFinalResults() {
		return finalresults;
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
		console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	}

	function setChosenAnswers(data) {
		console.log("set chosenAnswers");
		console.log(data.answers);
		answers = data.answers;
	}

	function setPlayerRoundResults(data) {
		console.log("player round results");
		console.log(data);
		playerRoundResults = data.results;
		voteCounter = data.voteNumber;
	}


	function gameFinish(data) {
		finalresults = data.results;
	}

	function setNumOfChoicesSubmitted(data) {
		answerCounter = data;
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
	}, {
		eventName: "numOfChoicesSubmitted",
		eventAction: setNumOfChoicesSubmitted
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
		getFinalResults: getFinalResults,
		nextRound: nextRound,
		finishGame: finishGame,
		getCurrentVotes: getCurrentVotes
	};

}]);
