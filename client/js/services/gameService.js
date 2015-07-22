ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;
	var answers = [];

	function getRoundQuestion() {
		return currentQuestion;
	}

	function startGame(roomId) {
		socket.emit("GAME start", {roomId: roomId});
	}

	function getAnswers() {
		return answers;
	}

	socket.on('GAME question', function(data) {
		console.log("got question " + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	socket.on('GAME voting', function(data) {
		answers = data;
	});

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getAnswers: getAnswers
	};

}]);
