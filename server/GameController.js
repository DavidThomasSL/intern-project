var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var roundCount = 0;
	var blackCards = [];
	var whiteCards = [];
	var rounds = [];

	//Number of white cards a user should always have
	var HANDSIZE = 7;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(usersInRoom, callback) {
		round = 0;

		path.join(__dirname, './BlackWhiteCards.json');

		//Read in the Black and white cards
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				throw err;
			} else {

				//set up each user
				var cards = JSON.parse(data);
				blackCards = cards.blackCards;
				whiteCards = cards.whiteCards;

				usersInRoom.forEach(function(user) {
					setupPlayer(user);
				});

				var round = {
					count: roundCount,
					question: getRoundQuestion(),
					answers: []
				}

				rounds.push(round);

				//return this game information back to the server
				callback({
					players: players,
					roundQuestion: round.question,
					round: roundCount
				});
			}
		});
	};

	/*
		Sets up a player with a user id, a new hand and 0 points
		Adds them to the player list
	*/
	var setupPlayer = function(user) {

		var player = {
			uId: user.uId,
			hand: dealUserHand(),
			points: 0
		};

		players.push(player);
	};

	/*
		Given a userId, get their hand of white cards they have at this point in the game
	*/
	var getUserHand = function(userId) {

	};

	/*
		Returns a random questions
	*/
	var getRoundQuestion = function() {

		var index = Math.floor((Math.random() * blackCards.length) + 1);
		var question = blackCards[index];

		return question.text;

		// return "__ Helps me sleep at night";
	};

	/*
		Gives a players an inital set of respones
	*/
	var dealUserHand = function() {

		var hand = [];

		for (var i = 0; i < HANDSIZE; i++) {
			var index = Math.floor((Math.random() * whiteCards.length) + 1);

			var card = whiteCards[index];
			hand.push(card);
		}

		return hand;
	};

	/*
		submit the answer and change the used card with another one in players
	 */
	var submitAnswer = function(playerId, answer, callback) {
		var answer = {
			playerId: playerId,
			answerText: answer
		};

		var currentRound = rounds[rounds.length-1];
		currentRound.answers.push(answer);

		//check if everyone submitted
		if (currentRound.answers.length === players.length) {
			startVoteStage(currentRound.answers);
			console.log("everyone submitted!");
		}

		console.log(currentRound.answers);
		//change the used card to a new card
	};

	var startVoteStage = function(answers) {

		// emit to server 'vote stage'
		// send to server all answers
	}

	return {
		initialize: initialize,
		submitAnswer: submitAnswer
	};
};
