ClonageApp.service('playerService', ['communicationService', 'dynamicTextService', function(communicationService, dynamicTextService) {

	/*
	--------------------
	PUBLIC API
		These are functions exposed by the service to the outside work i.e controllers,
	    and others who who use this service
	---------------------
	*/

	var currentlySubmittedAnswers = []; //if multiple blanks then hold the currently selected answers
	var currentFilledInQuestion = "";
	var cardsToReplace = [];
	var cardReplaceCost = 0; //variable holing the current cost of replacing a card


	//call function that emits to server the answer that was just submitted
	function submitChoice(enteredAnswer) {

		//build the submission state to decide weather to send the answer off or not
		var submissionState = dynamicTextService.getSubmissionState(currentQuestion, enteredAnswer, currentlySubmittedAnswers);
		currentlySubmittedAnswers = submissionState.currentlySubmittedAnswers;
		currentFilledInQuestion = submissionState.currentFilledInQuestion;

		//if enough answers have been selected to fill in the blanks then send off the array
		if (submissionState.readyToSend) {
			_emitChoice(currentlySubmittedAnswers);
			currentlySubmittedAnswers = [];
		}
	}

	//call function that emits to server the vote that was just submitted
	function submitVote(enteredAnswer) {
		_emitVote(enteredAnswer);
	}

	function sendReadyStatus(roomId) {
		sendMessage("PLAYER ready status", {
			roomId: roomId
		});
	}

	//the question with the currently selected answers filled in
	function getCurrentFilledInQuestion() {
		return currentFilledInQuestion;
	}

	/*
		Tell the server one of the players in the room wants to play again
		The server will response, and display a toast on the other clients windows
	*/
	function playAgain(userId, oldRoomId) {
		sendMessage('PLAYER play again', {
			userId: userId,
			oldRoomId: oldRoomId
		});
	}

	//replace the hand of the user
	function replaceHand(userHand) {
		sendMessage("PLAYER replace cards", {
			cardsToReplace: userHand
		});
	}


	/*
		Returns the cost of replacing each card times the number of cards replaced
	*/
	function getCurrentReplaceCost(replaceCost) {
		return (replaceCost * cardsToReplace.length);
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
	}

	/*
    ---------------
        REGISTERING COMMUNCATION API WITH LAYER
        Must register the user service with the communcation service,
        and provide an api to call back when recieving an event
    ----------------
     */

	communicationService.registerListener("PLAYER", [{
		eventName: "question",
		eventAction: _receiveQuestion
	}]);

	/*
    -------------------
    INTERNAL HELPER FUNCTIONS
    -----------------
    */

	//emit the answer that was just submitted: who submitted what and what room they are in
	function _emitChoice(answer) {
		sendMessage('PLAYER submitChoice', {
			answer: answer,
		});
	}

	//emit the vote that was just submitted: who voted for what and what room they are in
	function _emitVote(answer) {
		sendMessage('PLAYER vote', {
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
		submitChoice: submitChoice,
		submitVote: submitVote,
		sendReadyStatus: sendReadyStatus,
		replaceHand: replaceHand,
		getCurrentReplaceCost: getCurrentReplaceCost,
		getCurrentFilledInQuestion: getCurrentFilledInQuestion,
		playAgain: playAgain,
		_receiveQuestion: _receiveQuestion
	};

}]);
