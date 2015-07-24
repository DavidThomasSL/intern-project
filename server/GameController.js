var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var roundCount = 0;
	var rounds = [];
	var POINTS_PER_VOTE = 50;
	var blackCardsMaster = [];
	var whiteCardsMaster = [];
	var blackCardsCurrent = [];
	var whiteCardsCurrent = [];
	//deal from current arrays, when card it dealt remove it to stop player getting same cards

	//Number of white cards a user should always have
	var HANDSIZE = 7;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(usersInRoom, callback) {
		roundCount = 0;

		path.join(__dirname, './BlackWhiteCards.json');

		//Read in the Black and white cards
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				throw err;
			} else {

				//set up each user
				var cards = JSON.parse(data);
				blackCardsMaster = cards.blackCards.filter(function(card){
					return (card.pick === 1)
				});
				whiteCardsMaster = cards.whiteCards;
				blackCardsCurrent = blackCardsMaster.slice(0);
				whiteCardsCurrent = whiteCardsMaster.slice(0);

				//TODO : stop game if we don't have enough inital white cards (HANDSIZE * number of players)

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

	var newRound = function(callback) {
		roundCount += 1;
		var round = {
			count: roundCount,
			question: getRoundQuestion(),
			answers: []
		};

		rounds.push(round);

		//return this round information back to the server
		callback({
			players: players,
			roundQuestion: round.question,
			round: roundCount
		});
	};

	//finish game and send back final scores
	var finishGame = function(callback) {

		var results = [];

		players.forEach(function(pl){
			var result = {
				playerId: pl.uId,
				playerName : pl.name,
				score: pl.points
			};
			console.log(result);
			results.push(result);
		});

		// newRound();
		callback({
			res: results
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

		if (blackCardsCurrent.length <= 0) {
			blackCardsMaster.forEach(function(card) {
				blackCardsCurrent.push(card);
			});
		} //refreshing the card list if we reach the end of questions;

		var index = Math.floor((Math.random() * blackCardsCurrent.length));

		var question = blackCardsCurrent[index];
		blackCardsCurrent.splice(index, 1);
		//removing dealt card from card list

		return question.text;
	};

	/*
		Gives a players an inital set of respones
	*/
	var dealUserHand = function() {

		var hand = [];
		for (var i = 0; i < HANDSIZE; i++) {

			var index = Math.floor((Math.random() * whiteCardsCurrent.length));

			var card = whiteCardsCurrent[index];
			whiteCardsCurrent.splice(index, 1);
			//removing dealt card from card list

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
				player.hand = player.hand.filter(function(card) {
					if (card !== usedCard)
						return card;
				});
				var index = Math.floor((Math.random() * whiteCardsCurrent.length));
				card = whiteCardsCurrent[index];
				whiteCardsCurrent.splice(index, 1);
				//removing dealt card from card list
				player.hand.push(card);
			}
		});
	};

	/*
		submit the answer and change the used card with another one in players

	 */
	 //TODO change this to a promise with a reject clause

	var submitAnswer = function(playerId, playerName, answer, callback) {

		assignName(playerId, playerName);
		//for now just using the submit answer message to assign name of each player for final results

		var ans = {
			playerId: playerId,
			playerName: playerName,
			answerText: answer,
			playersVote: []
		};

		var currentRound = rounds[rounds.length-1];
		currentRound.answers.push(ans);
		updateHand(playerId, answer);

		//check if everyone submitted
		if (currentRound.answers.length === players.length) {
			callback({
				answers: currentRound.answers,
				allChoicesSubmitted : true
			});
		} else {
			callback({
				answers: currentRound.answers,
				allChoicesSubmitted : false
			});
		}
	};

	var assignName = function (playerId, playerName) {
		players.forEach(function(pl){
			if(pl.name === undefined && pl.uId === playerId){
				pl.name = playerName;
			}
		});
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

			var results = [];
			currentRound.answers.forEach(function(answer){
				var points;
				players.forEach(function(pl){
					if (pl.uId === answer.playerId) {
						points = pl.points;
					}
				});
				var result = {
					playerId: answer.playerId,
					playerName: answer.playerName,
					ans: answer.answerText,
					playerVote: answer.playersVote,
					playerPoints: points
				};
				results.push(result);
			});

			// newRound();
			callback({
				res: results,
				allVotesSubmitted : true,
				voteNumber : 0 //resetting the votes for the next round
			});
		} else {
			callback({
				res: null,
				allVotesSubmitted : false,
				voteNumber: countVotes(currentRound)
			});
		}
	};


	/*
	add 50 points to player -> called on each vote
	*/
	var addPoints = function(playerId) {
		console.log("added vote");
		players.forEach (function(player){
			if (player.uId === playerId ) {
				player.points += POINTS_PER_VOTE ;
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
		submitVote: submitVote,
		newRound: newRound,
		finishGame: finishGame
	};
};
