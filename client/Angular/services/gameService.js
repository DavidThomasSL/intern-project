ClonageApp.service('gameService', ['communicationService', 'dynamicTextService', function(communicationService, dynamicTextService) {

	/*--------------------
	//PUBLIC API
	 	These are functions exposed by the service to the outside work i.e controllers,
	    and others who who use this service
	//-------------------	*/

	var currentQuestion; // the current question containing the text and how many answers to submit
	var currentlySubmittedAnswers = []; //if multiple blanks then hold the currently selected answers
	var round = -1;
	var answers = [];
	var playerRoundResults = [];
	var voteCounter = 0;
	var maxRounds = 0; //variable holding the number of rounds wanted
	var currentFilledInQuestion = "";

	var countdown;
	var cardsToReplace = [];
	var cardReplaceCost = 0; //variable holing the current cost of replacing a card

	var votes = [];
	var timeout = 5000;
	var allRooms = [];

	function getTimeout() {
		return timeout;
	}

	function getHandReplaceCost() {
		return handReplaceCost;
	}

	//get the current question being asked, object contains text and amount of answers to pick
	function getCurrentQuestion() {
		return currentQuestion;
	}

	//the position in the order of answers for multiple answer selections
	function getAnswerPosition(answer) {
		var position = currentlySubmittedAnswers.indexOf(answer) + 1;
		return position;
	}

	function getCurrentRound() {
		return round;
	}

	function getMaxRounds() {
		return maxRounds;
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
		playerRoundResults = [];
		round = -1;
	}

	//return countdown -> undefined normally or number of seconds left when reconnecting
	function getCountdown() {
		return countdown;
	}

	/*
		set the countdown to a certain value
		 - function called to retain the counter value when redirected to the waiting page
	*/
	function setCountdown(value) {
		countdown = value;
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
        check if a certain user had submitted an answer yet
        function called in order to visualise on the timer when a certain player has submited
    */
	function hasSubmitted(user) {

		var submitted = false;

		if (answers.length > 0) {
			answers.forEach(function(answer) {
				if (answer.player.uId === user)
					submitted = true;
			});
		}
		return submitted;
	}

	/*
        check if a certain user had voted for an answer yet
        function called in order to visualise on the timer when a certain player has submitted
    */
	function hasVoted(user) {

		var voted = false;

		if (votes.length > 0) {
			votes.forEach(function(vote) {
				if (vote.playersWhoVotedForThis.length > 0) {
					vote.playersWhoVotedForThis.forEach(function(player) {
						if (player.name === user)
							voted = true;
					});
				}
			});
		}
		return voted;
	}

	/*
		Tell the server one of the players in the room wants to play again
		The server will response, and display a toast on the other clients windows
	*/
	function playAgain(userId, oldRoomId) {
		sendMessage('GAME play again', {
			userId: userId,
			oldRoomId: oldRoomId
		});
	}

	function allRoomsAvailable() {
		return allRooms;
	}


	/*

	---------------
	    COMMUNCATION LAYER API
	    These are functions called by the communcation
	    service when it recives a message for the user service
	---------------
	*/

	function _receiveQuestion(data) {
		currentQuestion = data.question;
		currentFilledInQuestion = data.question.text;
		round = data.round;
		maxRounds = data.maxRounds;
		handReplaceCost = data.handReplaceCost;
		countdown = data.countdown;
		if (countdown === undefined) {
			answers = [];
			voteCounter = 0;
			votes = [];
		}

		/*
		generating the filled in question based on the question text and submitted answers
		done in both the _recieveQuestion and _setChosenAnswers functions as we can't be sure what info
		we will get first when refreshing. The filledInText is another property attached to each answer just on the
		client side used to display each answer in its context.
		*/
		if (answers !== undefined) {
			answers.forEach(function(answer) {
				answer.filledInText = dynamicTextService.fillInSelections(currentQuestion.text, answer.answersText);
			});
		}
	}

	function _setChosenAnswers(data) {
		answers = data.answers;

		//generating the filled in question based on the question text and submitted answers as above
		if (currentQuestion !== undefined) {
			answers.forEach(function(answer) {
				answer.filledInText = dynamicTextService.fillInSelections(currentQuestion.text, answer.answersText);
			});
		}

		countdown = data.countdown;
		if (countdown === undefined) {
			votes = [];
		}
	}

	function _setPlayerRoundResults(data) {
		playerRoundResults = data.results;
		votes = data.currentVotes;
		voteCounter = data.voteNumber;
	}

	function _setMaxRounds(num) {
		maxRounds = num;
	}

	function _setTimeout(data) {
		timeout = data.timeout;
	}

	function _setRoomsAvailable(data) {
		console.log(data);
		allRooms = data;
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
		eventName: "timeout",
		eventAction: _setTimeout
	}, {
		eventName: "rooms available",
		eventAction: _setRoomsAvailable
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

	return {
		getCurrentQuestion: getCurrentQuestion,
		getAnswerPosition: getAnswerPosition,
		getAnswers: getAnswers,
		getCurrentRound: getCurrentRound,
		getPlayerRoundResults: getPlayerRoundResults,
		getCurrentVotes: getCurrentVotes,
		getMaxRounds: getMaxRounds,
		getPlayerCurrentRank: getPlayerCurrentRank,
		getHandReplaceCost: getHandReplaceCost,
		_receiveQuestion: _receiveQuestion,
		_setChosenAnswers: _setChosenAnswers,
		_setPlayerRoundResults: _setPlayerRoundResults,
		_setMaxRounds: _setMaxRounds,
		clearGameData: clearGameData,
		getCountdown: getCountdown,
		setCountdown: setCountdown,
		hasVoted: hasVoted,
		hasSubmitted: hasSubmitted,
		getTimeout: getTimeout,
		playAgain: playAgain,
		allRoomsAvailable: allRoomsAvailable,
	};

}]);
