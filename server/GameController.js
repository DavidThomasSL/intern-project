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
				};

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
	update a users hand by replacing the used card with a new random one
	*/
	var updateHand = function(userId, usedCard) {
		players.forEach(function(player){
			if (player.uId === userId) {
				player.hand.forEach(function(card){
					if (card === usedCard) {
						var index = Math.floor((Math.random() * whiteCards.length) + 1);
						card = whiteCards[index];
					}
				});
			}
		});
	};

	/*
		submit the answer and change the used card with another one in players
	 */
	var submitAnswer = function(playerId, answer, callback) {

		var ans = {
			playerId: playerId,
			answerText: answer,
			playersVote: []
		};

		var currentRound = rounds[rounds.length-1];
		currentRound.answers.push(ans);
		updateHand(playerId, answer);

		//check if everyone submitted
		if (currentRound.answers.length === players.length) {
			callback({
				answers: currentRound.answers
			});
		}
	};

		/*
		submit the vote and change the used card with another one in players
	 */
	var submitVote = function(playerId, answer, callback) {

		var currentRound = rounds[rounds.length-1];

		currentRound.answers.forEach(function(option){
			if(option.answerText === answer) {
				option.playersVote.push(playerId);
				addPoints(option.playerId);
			}
		});

		//check if everyone voted
		if (countVotes(currentRound) === players.length) {
			console.log("everyone voted!");
			// newRound();
			callback({
				answers: currentRound.answers
			});
		}

		console.log(currentRound.answers);
	};


	// var newRound = function() {
	// 	roundCount +=1 ;
	// 	var round = {
	// 		count: roundCount,
	// 		question: getRoundQuestion(),
	// 		answers: []
	// 	};
	// 	rounds.push(round);
	// }

	/*
	add 50 points to player -> called on each vote
	*/
	var addPoints = function(playerId) {
		console.log("added vote");
		players.forEach (function(player){
			if (player.uId === playerId ) {
				player.points += 50 ;
			}
		});
	};

	/*
	count the overall votes in this round
	*/
	var countVotes = function(currentRound) {
		var votes = 0 ;
		currentRound.answers.forEach(function(option){
			votes += option.playersVote.length;
		});
		return votes ;
	};

	return {
		initialize: initialize,
		submitAnswer: submitAnswer,
		submitVote: submitVote
	};
};
