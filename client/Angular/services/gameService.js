ClonageApp.service('gameService', ['communicationService', 'dynamicTextService', function(communicationService, dynamicTextService, $timeout) {

	/*--------------------
	//PUBLIC API
	 	These are functions exposed by the service to the outside work i.e controllers,
	    and others who who use this service
	//-------------------	*/

	var currentQuestion = undefined; // the current question containing the text and how many answers to submit
	var currentlySubmittedAnswers = []; //if multiple blanks then hold the currently selected answers
	var round = -1;
	var answers = [];
	var playerRoundResults = [];
	var voteCounter = 0;
	var maxRounds = 0; //variable holding the number of rounds wanted
	var currentFilledInQuestion = "";
	var countdown = undefined;


	//call function that emits to server the answer that was just submitted
	function submitChoice(enteredAnswer) {
		var submissionState = dynamicTextService.getSubmissionState(currentQuestion,enteredAnswer,currentlySubmittedAnswers);
		currentlySubmittedAnswers = submissionState.currentlySubmittedAnswers;
		currentFilledInQuestion = submissionState.currentFilledInQuestion;

		//if enough answers have been selected to fill in the blanks then send off the array
		if (submissionState.readyToSend){
			_emitChoice(currentlySubmittedAnswers);
			currentlySubmittedAnswers = [];
		}
	}

	//call function that emits to server the vote that was just submitted
	function submitVote(enteredAnswer) {
		_emitVote(enteredAnswer);
	}

	//get the current question being asked, object contains text and amount of answers to pick
	function getCurrentQuestion() {
		return currentQuestion;
	}

	//the question with the currently selected answers filled in
	function getCurrentFilledInQuestion() {
		return currentFilledInQuestion;
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
            answers.forEach( function(answer){
                if (answer.player.uId === user)
                    submitted = true;
            });
         }

        return submitted;
    };

     /*
        check if a certain user had voted for an answer yet
        function called in order to visualise on the timer when a certain player has submitted
    */
    function hasVoted(user) {

        var voted = false;

        if (playerRoundResults.length > 0) {
            playerRoundResults.forEach( function(vote) {
                if (vote.playersWhoVotedForThis.length > 0) {
                    vote.playersWhoVotedForThis.forEach ( function(player) {
                        if (player === user)
                            voted = true;
                    });
                }
            });
         }

        return voted;
    };


	/*
	---------------
	    COMMUNCATION LAYER API
	    These are functions called by the communcation
	    service when it recives a message for the user service
	---------------
	*/

	function _receiveQuestion(data) {
		currentQuestion = data.question;
		currentQuestionText = data.question.text;
		currentFilledInQuestion = data.question.text;
		currentQuestionBlanks = data.question.pick;
		round = data.round;
		maxRounds = data.maxRounds;
		countdown = data.countdown;
		if (countdown === undefined) {
			answers = [];
			voteCounter = 0;
			playerRoundResults = [];
		}
	}

	function _setChosenAnswers(data) {
		answers = data.answers;
		countdown = data.countdown;
		playerRoundResults = [];
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



	return {
		getCurrentQuestion: getCurrentQuestion,
		getCurrentFilledInQuestion: getCurrentFilledInQuestion,
		getAnswerPosition: getAnswerPosition,
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
		clearGameData: clearGameData,
		getCountdown: getCountdown,
		setCountdown: setCountdown,
		hasVoted: hasVoted,
		hasSubmitted: hasSubmitted
	};

}]);
