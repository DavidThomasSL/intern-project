var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var round = 0;
	var blackCards = [];
	var whiteCards = [];

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

				//return this game information back to the server
				callback({
					players: players,
					roundQuestion: getRoundQuestion(),
					round: round
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
	}

	/*
		Given a userId, get their hand of white cards they have at this point in the game
	*/
	var getUserHand = function(userId) {

	}

	/*
		Returns a random questions
	*/
	var getRoundQuestion = function() {

		var index = Math.floor((Math.random() * blackCards.length) + 1);
		console.log(index);
		var question = blackCards[index];
		console.log(question);

		return question.text;

		// return "__ Helps me sleep at night";
	};

	/*
		Gives a players an inital set of respones
	*/
	var dealUserHand = function() {
		return ["Seagulls", "THe Jews", "The Gay Agenda", "Ben and Jerries", "Ethnic Cleansing"];
	};

	/*
	 
	 */
	var submitAnswer = function(round, userId) {

	};

	return {
		initialize: initialize
	};
};