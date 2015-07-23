ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var results = [];
	var finalresults = [];
	var maxRounds = 8; //variable holding the number of rounds wanted

    //--------------------
    //PUBLIC API
    //-------------------

	function getRoundQuestion() {
		return currentQuestion;
	}

	function getCurrentRound() {
		return round;
	}

	function startGame(roomId) {
		socket.emit("GAME start", {roomId: roomId});
	}

	//get all answers submitted
	function getAnswers() {
		return answers;
	}

	//get results of voting
	function getResults() {
		return results;
	}

	//get final scores after the game finished
	function getFinalResults() {
		console.log(finalresults);
		return finalresults;
	}

	//load next round or finish the game if that was the last round
	function nextRound(roomId) {
		if ( round !== maxRounds ) {
			round++ ;
			socket.emit("GAME next round", {roomId: roomId});
		}
		else {
			socket.emit("GAME finish", {roomId: roomId});
		}
	}

	//tell server to finish the game
	function finishGame(roomId) {
		socket.emit("GAME finish", {roomId: roomId});
	}


    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------

	socket.on('GAME question', function(data) {
		console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	//load all answers in order to begin voting
	socket.on('GAME voting', function(data) {
		answers = data;
	});

	//after each round get the results of voting
	socket.on('GAME results', function(data) {
		results = data.results;
	});

	//when game finished load the final scores into finalresults variable
	socket.on('GAME finish', function(data) {
		finalresults = data.results;
	});

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getResults: getResults,
		getFinalResults: getFinalResults,
		nextRound: nextRound,
		finishGame: finishGame
	};

}]);
