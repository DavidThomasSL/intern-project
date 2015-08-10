ClonageApp.service('gameService', ['communicationService', function(communicationService) {

	/*--------------------
	//PUBLIC API
	 	These are functions exposed by the service to the outside work i.e controllers,
	    and others who who use this service
	//-------------------	*/

	var currentQuestionText = "";
	var currentQuestionBlanks = 0;
	var currentlySubmittedAnswers = [];
	var round = -1;
	var answers = [];
	var playerRoundResults = [];
	var voteCounter = 0;
	var maxRounds = 0; //variable holding the number of rounds wanted
	var currentFilledInQuestion = "";


	//call function that emits to server the answer that was just submitted
	function submitChoice(enteredAnswer) {
		var alreadySelected = false;
		currentlySubmittedAnswers.forEach(function(currentAnswer) {
			if (currentAnswer === enteredAnswer) {

				//if reselecting an answer remove it from the array to send
				alreadySelected = true;
				currentlySubmittedAnswers = currentlySubmittedAnswers.filter(function(answer) {
					return (enteredAnswer !== answer);
				});
			}
		});
		currentFilledInQuestion = fillInSelections(currentQuestionText, currentlySubmittedAnswers);
		//if clicking a new answer, add it to the array to send
		if (!alreadySelected) {
			currentlySubmittedAnswers.push(enteredAnswer);
			currentFilledInQuestion = fillInSelections(currentQuestionText, currentlySubmittedAnswers);
			if (currentlySubmittedAnswers.length === currentQuestionBlanks) {
				//when the user has selected enough answers, send them as an array
				_emitChoice(currentlySubmittedAnswers);
				currentlySubmittedAnswers = [];
			}
		}
	}

	//call function that emits to server the vote that was just submitted
	function submitVote(enteredAnswer) {
		_emitVote(enteredAnswer);
	}

	function getRoundQuestionText() {
		return currentQuestionText;
	}

	function getCurrentlySubmittedAnswers() {
		return currentlySubmittedAnswers;
	}

	function getCurrentFilledInQuestion() {
		return currentFilledInQuestion;
	}

	function getAnswerPosition(answer) {
		var position = currentlySubmittedAnswers.indexOf(answer) + 1;
		return position;
	}

	function getCurrentQuestionBlanks() {
		return currentQuestionBlanks;
	}

	function getCurrentRound() {
		return round;
	}

	function getMaxRounds() {
		return maxRounds;
	}

	function sendReadyStatus(roomId) {
		sendMessage("GAME ready status", {
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

	// Clears local game data when the user leaves the game
	function clearGameData() {
		playerRoundResults = null;
		round = -1;
	}

	//get results of voting
	function getPlayerRoundResults() {
		return playerRoundResults;
	}

	function getPlayerCurrentRank(playerId) {
		var returnValue = "";

		if (playerRoundResults !== null) {
			playerRoundResults.forEach(function(playerResult) {
				if (playerId === playerResult.player.uId) {
					returnValue = playerResult.player.rank;
				}
			});
		}

		return returnValue;
	}
	/*
	---------------
	    COMMUNCATION LAYER API
	    These are functions called by the communcation
	    service when it recives a message for the user service
	---------------
	*/

	function _receiveQuestion(data) {
		currentQuestionText = data.question.text;
		currentFilledInQuestion = data.question.text;
		currentQuestionBlanks = data.question.pick;
		round = data.round;
		maxRounds = data.maxRounds;
	}

	function _setChosenAnswers(data) {
		answers = data.answers;
	}

	function _setPlayerRoundResults(data) {
		playerRoundResults = data.results;
		voteCounter = data.voteNumber;
	}

	function _setMaxRounds(num) {
		maxRounds = num;
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
		eventAction: _receiveQuestion
	}, {
		eventName: "answers",
		eventAction: _setChosenAnswers
	}, {
		eventName: "playerRoundResults",
		eventAction: _setPlayerRoundResults
	}]);

	/*
    -------------------
    INTERNAL HELPER FUNCTIONS
    -----------------
    */

	//emit the answer that was just submitted: who submitted what and what room they are in
	function _emitChoice(answer) {
		sendMessage('USER submitChoice', {
			answer: answer,
		});
	}

	//emit the vote that was just submitted: who voted for what and what room they are in
	function _emitVote(answer) {
		sendMessage('USER vote', {
			answer: answer,
		});
	}

	function sendMessage(eventName, data, callback) {
		if (callback === undefined) {
			callback = function() {};
		}
		communicationService.sendMessage(eventName, data, callback);
	}

	function fillInSelections(questionText, currentSelections) {
		var outputText = questionText;
		var removedFullStops = [];
		//formatting selected answers so they can be put into the question
		// var removedFullStops = currentSelections.slice();
		// removedFullStops = removedFullStops.map(function(selection) {
		// 	selection = selection.replace(/.\s*$/, "");
		// 	selection = "[" + selection + "]";
		// 	console.log(selection);
		// });

		currentSelections.forEach(function(selection){
			var selectionToPush = selection.replace(/.\s*$/, "");
			selectionToPush = "[" + selectionToPush + "]";
			removedFullStops.push(selectionToPush);
		});

		if (questionText.indexOf('_') === -1) {
			outputText += "\n";
			removedFullStops.forEach(function(selection) {
				outputText += removedFullStops + ",\n";
			});
			outputText = outputText.replace(/.\s*$/, ".");
			return
		} else {
			for (var i = 0; i < currentSelections.length; i++) {
				outputText = outputText.replace('_', removedFullStops[i]);
			}
		}
		return outputText;
	}

	return {
		getRoundQuestionText: getRoundQuestionText,
		getCurrentlySubmittedAnswers: getCurrentlySubmittedAnswers,
		getCurrentFilledInQuestion: getCurrentFilledInQuestion,
		getAnswerPosition: getAnswerPosition,
		getCurrentQuestionBlanks: getCurrentQuestionBlanks,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getPlayerRoundResults: getPlayerRoundResults,
		getCurrentVotes: getCurrentVotes,
		getMaxRounds: getMaxRounds,
		getPlayerCurrentRank: getPlayerCurrentRank,
		sendReadyStatus: sendReadyStatus,
		submitChoice: submitChoice,
		submitVote: submitVote,
		_receiveQuestion: _receiveQuestion,
		_setChosenAnswers: _setChosenAnswers,
		_setPlayerRoundResults: _setPlayerRoundResults,
		_setMaxRounds: _setMaxRounds,
		clearGameData: clearGameData
	};

}]);