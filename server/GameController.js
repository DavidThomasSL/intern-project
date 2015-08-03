var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var roundCount = 1;
	var maxRounds = 3;
	var rounds = [];
	var POINTS_PER_VOTE = 50;
	var blackCardsMaster = [];
	var whiteCardsMaster = [];
	var blackCardsCurrent = [];
	var whiteCardsCurrent = [];

	// Message Functions pass in on creation from the server
	// Allows the gameController to send messages via to server to clients
	//deal from current arrays, when card it dealt remove it to stop player getting same cards

	//Number of white cards a user should always have
	var HANDSIZE = 7;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(usersInRoom, callback) {
		roundCount = 1;

		path.join(__dirname, './BlackWhiteCards.json');

		//Read in the Black and white cards
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				throw err;
			} else {

				//set up each user
				var cards = JSON.parse(data);
				blackCardsMaster = cards.blackCards.filter(function(card) {
					return (card.pick === 1);
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

				var scores = [];
				players.forEach(function(pl) {
					var score = {
						playerId: pl.uId,
						playerName: pl.name,
						points: pl.points,
						rank: pl.rank
					};
					scores.push(score);
				});

				//return this game information back to the server
				callback({
					players: players,
					roundQuestion: round.question,
					round: roundCount,
					scores: scores
				});
			}
		});
	};

	var newRound = function(callback) {
		var gameOver = (roundCount >= maxRounds);
		roundCount += 1;
		if (gameOver) {
			roundCount = -1;
		}
		var round = {
			count: roundCount,
			question: getRoundQuestion(),
			answers: []
		};

		rounds.push(round);

		setRank();
		var scores = [];
		players.forEach(function(pl) {
			var score = {
				playerId: pl.uId,
				playerName: pl.name,
				points: pl.points,
				rank: pl.rank
			};
			scores.push(score);
		});

		//return this round information back to the server
		callback({
			players: players,
			roundQuestion: round.question,
			round: roundCount,
			scores: scores,
			gameIsOver: gameOver
		});
	};

	var setRank = function() {
		players.sort(function(a, b) {
			return parseInt(b.points) - parseInt(a.points);
		});
		for (var i = 0; i <= players.length - 1; i++) {
			players[i].rank = i + 1;
		}
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
		players.forEach(function(player) {
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
		Submit a user answer to a question

		Adds the user's answer to the round answers, with their details,
		the answer text and an (empty) list of who voted for it.

		Updates the users hand to give them a new card

		Checks if everyone has submitted their answers, and if tells the server to route them
		to next stage

	 */
	var submitAnswer = function(playerId, playerName, answerText, callback) {

		var player;

		//FInd the player who submmited this
		players.forEach(function(pl) {
			if (pl.uId === playerId) {
				player = pl;
			}
		})

		// Build the submitted answer
		var ans = {
			player: player,
			answerText: answerText,
			playersVote: []
		};

		//Get the current round object, which will hold all the answers for that round
		var currentRound = rounds[rounds.length - 1];
		currentRound.answers.push(ans);

		//Update this players hand with a new card, as they have just played one
		updateHand(playerId, answerText);

		//check if everyone submitted and sends back all the currently submitted answers
		var allChoicesSubmitted;
		if (currentRound.answers.length === players.length) {
			allChoicesSubmitted = true;
		} else {
			allChoicesSubmitted = false;
		}

		callback({
			answers: currentRound.answers,
			allChoicesSubmitted: allChoicesSubmitted
		});

	};


	/*
		Submit a user vote for an snwer

		Answers are the submissiions from users
		Gets the answer this vote is for
		Add points to the player who submitted that answer
		Adds the voting user's name to the list of people who voted for this answer

		If everyone has submitted a vote, will return with All Votes submitted as true,
		which is checked by the server in the callback.

		Return results, an array of objects for each answer that has been submitted
		The result object holds who submitted it, voted for it, the voters rank and points
	 */
	var submitVote = function(playerId, votedForText, callback) {

		var currentRound = rounds[rounds.length - 1];
		var results = [];


		// Add points and voting user's name to answer
		// Create result "leagueTable" object
		currentRound.answers.forEach(function(answer) {
			if (answer.answerText === votedForText) {
				answer.playersVote.push(getName(playerId));
				addPoints(answer.player.uId);
			}

			// Update every player's rank in the room
			setRank();

			//Build result object for each answer submitted
			players.forEach(function(pl) {
				if (pl.uId === answer.player.uId) {

					var result = {
						player: pl,
						answerText: answer.answerText,
						playersWhoVotedForThis: answer.playersVote,
					};

					results.push(result);
				}
			});
		});

		var allVotesSubmitted;
		var voteNumber;

		//check if everyone voted
		if (countVotes(currentRound) === players.length) {
			allVotesSubmitted = true;
			voteNumber = 0;
		} else {
			voteNumber = countVotes(currentRound);
			allVotesSubmitted = false;
		}

		callback({
			res: results,
			allVotesSubmitted: allVotesSubmitted,
			voteNumber: countVotes(currentRound)
		});

	};


	/*
		add 50 points to player -> called on each vote
	*/
	var addPoints = function(playerId) {
		players.forEach(function(player) {
			if (player.uId === playerId) {
				player.points += POINTS_PER_VOTE;
			}
		});
	};

	/*
		count the overall votes in this round
	*/
	var countVotes = function(currentRound) {
		var votes = 0;
		currentRound.answers.forEach(function(option) {
			votes += option.playersVote.length;
		});
		return votes;
	};

	var getName = function(playerId) {
		var name;
		players.forEach(function(pl) {
			if (parseInt(pl.uId) === parseInt(playerId)) {
				name = pl.name;
			}
		});
		return name;
	};

	/*
		Sets up a player with a user id, a new hand and 0 points
		Adds them to the player list
	*/
	var setupPlayer = function(user) {

		var player = {
			uId: user.uId,
			name: user.username,
			hand: dealUserHand(),
			points: 0,
			rank: ""
		};

		players.push(player);
	};

	return {
		initialize: initialize,
		submitAnswer: submitAnswer,
		submitVote: submitVote,
		newRound: newRound,
	};
};