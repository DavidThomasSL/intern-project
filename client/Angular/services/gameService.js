ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var roundVotes = [];
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

	function getRoundVotes() {
		return roundVotes;
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
		console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	socket.on('GAME chosenAnswers', function(data) {
		answers = data;
	});

	socket.on('GAME roundVotes', function(data) {
		roundVotes = data.results;
	});

	socket.on('GAME finish', function(data) {
		finalresults = data.results;
	});

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getRoundVotes: getRoundVotes,
		getFinalResults: getFinalResults,
		nextRound: nextRound,
		finishGame: finishGame
	};

}]);
