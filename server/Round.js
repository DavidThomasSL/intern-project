function Round(roundCount, cardController) {

	var self = this;

	var roundNumber = roundCount;

	/*
		An array of submission objects for the current round
		And submission object contains :
			- player - The player who submitted this
			- submissionsText : The array of strings relating to the answer cards of the submission
			- playersWhoVotedForThis: An array of player objects, everyone who voted for this submission
	*/
	var roundSubmissions = [];

	var roundQuestion = {};


	self.getRoundSubmissionData = function() {
		return roundSubmissions;
	};

	self.getRoundQuestion = function() {
		return roundQuestion;
	};

	self.getRoundCount = function() {
		return roundNumber;
	};

	self.getNumberOfCurrentSubmissions = function() {
		var submissionCounter = 0;
		roundSubmissions.forEach(function(submission){
			if(submission.submissionsText.length > 0){
				submissionCounter++;
			};
		});
		return submissionCounter;
	};

	self.getNumberOfCurrentVotes = function() {
		var voteCounter = 0;
		roundSubmissions.forEach(function(submission){
			voteCounter += submission.playersWhoVotedForThis.length;
		});
		return voteCounter;
	};

	self.isVotingComplete = function(numberOfConnectedPlayers) {
		var maxPossibleVotes = numberOfConnectedPlayers;

		roundSubmissions.forEach(function(submission){
			if(!submission.player.hasSubmitted) {
				availableAns = roundSubmissions.filter(function(ans){
					return ans.player.uId !== submission.player.uId;
				});
				if(availableAns.length === 0) {
					maxPossibleVotes--;
				}
			}
		});
		return maxPossibleVotes === getNumberOfCurrentVotes();
	};

	/*
		When the round starts with a set of players we generate a blank set of submissionsData
	*/
	self.initialise = function(players){
		players.forEach(function(player){
			submission = {
				player : player,
				submissionsText : [],
				playersWhoVotedForThis : []
			};
			roundSubmissions.push(submission);
		});
		roundQuestion = cardController.getQuestion();
	};

	self.addSubmission = function(submittingPlayer, answersText){
		roundSubmissions.forEach(function(submission){
			if(submission.player.uId === submittingPlayer.uId){
				submission.submissionsText = answersText;
			}
		});
	};


	self.addVote = function(votingPlayer, submissionVotedFor){
		roundSubmissions.forEach(function(submission){
			if(submissionVotedFor.player.uId === submission.player.uId)
			{
				submission.playersWhoVotedForThis.push(votingPlayer);
			}
		});
	};

}

module.exports = Round;
