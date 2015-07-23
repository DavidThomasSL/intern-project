ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];
	var voteOptions = [];

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


    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------

	socket.on('GAME question', function(data) {
		currentQuestion = data.question;
		round = data.round;
	});

	socket.on('GAME answers', function(data) {
		answers = data;
	});


	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound
	};

}]);
