ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var results = [];

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
		console.log(results);
		return results;
	}

	function nextRound(roomId) {
		socket.emit("GAME next round", {roomId: roomId});
	}


    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------

	socket.on('GAME question', function(data) {
		console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	socket.on('GAME voting', function(data) {
		answers = data;
	});

	socket.on('GAME results', function(data) {
		results = data.results;
	});

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getResults: getResults,
		nextRound: nextRound
	};

}]);
