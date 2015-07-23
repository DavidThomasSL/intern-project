ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var results = [];
	var finalresults = [];

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

	function getAnswers() {
		return answers;
	}

	function getResults() {
		return results;
	}

	function getFinalResults() {
		console.log(finalresults);
		return finalresults;
	}

	function nextRound(roomId) {
		if ( round !== 1 ) {
			round++ ;
			socket.emit("GAME next round", {roomId: roomId});
		}
		else {
			socket.emit("GAME finish", {roomId: roomId});
		}
	}

	function finishGame(roomId) {
		socket.emit("GAME finish", {roomId: roomId});
	}


    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------

	socket.on('GAME question', function(data) {
		// console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	socket.on('GAME voting', function(data) {
		answers = data;
	});

	socket.on('GAME results', function(data) {
		results = data.results;
	});

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
