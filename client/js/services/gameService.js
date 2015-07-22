ClonageApp.service('gameService', ['socket', function(socket) {

	var currentQuestion = "";
	var round = -1;

	function getRoundQuestion() {
		return currentQuestion;
	}

	function getCurrentRound() {
		return round;
	}

	function startGame(roomId) {
		socket.emit("GAME start", {roomId: roomId});
	}

	socket.on('GAME question', function(data) {
		console.log("got question" + data.question);
		currentQuestion = data.question;
		round = data.round;
	});

	return {
		startGame: startGame,
		getRoundQuestion: getRoundQuestion,
		getCurrentRound: getCurrentRound
	};

}]);
