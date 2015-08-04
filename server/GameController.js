var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var roundCount = 0;
	var maxRounds = 3;
	var rounds = [];
	var POINTS_PER_VOTE = 50;
	var blackCardsMaster = [];
	var whiteCardsMaster = [];
	var blackCardsCurrent = [];
	var whiteCardsCurrent = [];

	// Indicate what gamestate the gamecontroller is currently in
	var POSSIBLE_GAMESTATES = {
		'QUESTION': 1,
		'VOTING': 2,
		'ROUND_RESULTS': 3,
		'FINAL_RESULTS': 4
	};
	var GAMESTATE;

	// Message Functions pass in on creation from the server
	// Allows the gameController to send messages via to server to clients
	//deal from current arrays, when card it dealt remove it to stop player getting same cards

	//Number of white cards a user should always have
	var HANDSIZE = 7;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(usersInRoom, callback) {

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

				usersInRoom.forEach(function(user) {
					setupPlayer(user);
				});

				callback();
			}
		});
	};

	/*
		Moves the gameController to the next round
		FInd out if the game is over or should continue

		Returns to the server new round information
	*/
	var newRound = function(callback) {

		var gameOver = (roundCount >= maxRounds);
		var data;

		// Check if game over
		if (gameOver) {

			GAMESTATE = POSSIBLE_GAMESTATES['FINAL_RESULTS'];

			data = {
				gameIsOver: true
			}

		} else {

			// Create new round
			roundCount += 1;

			var round = {
				count: roundCount,
				question: getRoundQuestion(),
				answers: []
			};

			rounds.push(round);

			GAMESTATE = POSSIBLE_GAMESTATES['QUESTION'];

			data = {
				players: players,
				roundQuestion: round.question,
				round: roundCount,
				gameIsOver: false
			}
		}

		//return this round information back to the server
		callback(data);
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
		Submit a user answer to a question

		Adds the user's answer to the round answers, with their details,
		the answer text and an (empty) list of who voted for it.

		Updates the users hand to give them a new card

		Checks if everyone has submitted their answers, and if tells the server to route them
		to next stage

	 */
	var submitAnswer = function(playerId, playerName, answerText, callback) {

		var submittingPlayer = getPlayerFromId(playerId);

		if (submittingPlayer.hasSubmitted) {
			//can't submit twice
		} else {

			submittingPlayer.hasSubmitted = true;

			// Build the submitted answer
			var ans = {
				player: submittingPlayer,
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

			if (currentRound.answers.length === getNumOfConnectedPlayers()) {
				// change gametsate to the next stage
				GAMESTATE = POSSIBLE_GAMESTATES['VOTING'];
				setAllPlayersAbleToSubmit()

				allChoicesSubmitted = true;
			} else {
				allChoicesSubmitted = false;
			}

			callback({
				answers: currentRound.answers,
				allChoicesSubmitted: allChoicesSubmitted
			});
		}



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

		// Add the user's vote to the answer
		currentRound.answers.forEach(function(answer) {
			if (answer.answerText === votedForText) {
				answer.playersVote.push(getName(playerId));
			}

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
		if (countVotes(currentRound) === getNumOfConnectedPlayers()) {

			//add the points to the players for each vote they received
			currentRound.answers.forEach(function(answer) {
				for (var i = 0; i < answer.playersVote.length; i++) {
					addPoints(answer.player.uId);
				}
			});

			// Update every player's rank in the room
			setRank();

			//change the gamestate to the next stage
			GAMESTATE = POSSIBLE_GAMESTATES['ROUND_RESULTS'];

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
		Catches a reconnecting user up with the current game status

		Sends the
			routing information (what page are we on)
			game information (game question, user hand)
			round information (current votes, etc for table)

	*/
	var getInfoForReconnectingUser = function(userId, callback) {

		//GET round information
		var routingInfo = "";
		var gameData = {};
		var userData = {};
		var data = [];
		var player;

		var currentRound = rounds[roundCount - 1];

		// Tell controller player is now active again
		players.forEach(function(playerInGame) {
			if (playerInGame.uId === userId) {
				player = playerInGame
			}
		})

		player.connectedToServer = true;

		if (GAMESTATE === POSSIBLE_GAMESTATES['QUESTION']) {
			if (player.hasSubmitted) {
				routingInfo = "waitVote";

				gameData = {
					eventName: "GAME answers",
					data: {
						answers: currentRound.answers,
					}
				}

				data.push(gameData);

			} else {
				routingInfo = "question";
			}

			gameData = {
				eventName: "GAME question",
				data: {
					question: currentRound.question,
					round: currentRound.count
				}
			}

			userData = {
				eventName: "USER hand",
				data: {
					hand: player.hand
				}
			}

			data.push(userData);
			data.push(gameData);

		} else if (GAMESTATE === POSSIBLE_GAMESTATES['VOTING']) {
			routingInfo = "vote";
		} else if (GAMESTATE === POSSIBLE_GAMESTATES['ROUND_RESULTS']) {
			routingInfo = "results";
		} else if (GAMESTATE === POSSIBLE_GAMESTATES['FINAL_RESULTS']) {
			routingInfo = "endGame";
		}

		console.log(data);

		callback(routingInfo, data);

	}

	/*
		Given a user id, returns if that user is a player in this game
	*/
	var checkIfUserInGame = function(userId) {
		var inRoom = false;
		players.forEach(function(player) {
			if (player.uId === userId) {
				inRoom = true;
			}
		})
		return inRoom;
	}

	var getNumOfConnectedPlayers = function() {
		var counter = 0;
		players.forEach(function(player) {
			if (player.connectedToServer) {
				counter++;
			}
		});
		return counter;
	};

	var getPlayerFromId = function(playerId) {
		var player;
		players.forEach(function(pl) {
			if (pl.uId === playerId) {
				player = pl;
			}
		});
		return player;
	}

	function setAllPlayersAbleToSubmit() {
		players.forEach(function(player){
			player.hasSubmitted = false;
		});
	}

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
		Gives a rank to every player in the game based on their points total
	*/
	var setRank = function() {
		players.sort(function(a, b) {
			return parseInt(b.points) - parseInt(a.points);
		});
		for (var i = 0; i <= players.length - 1; i++) {
			players[i].rank = i + 1;
		}
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
		Sets up a player with a user id, a new hand and 0 points
		Adds them to the player list
	*/
	var setupPlayer = function(user) {

		var player = {
			uId: user.uId,
			name: user.username,
			hand: dealUserHand(),
			hasSubmitted: false,
			points: 0,
			rank: "",
			connectedToServer: true
		};

		players.push(player);
	};

	var disconnectPlayer = function(playerId) {
		var player;

		//Find the player who submmited this
		players.forEach(function(pl) {
			if (pl.uId === playerId) {
				player = pl;
			}
		});
		player.connectedToServer = false;
	};

	return {
		initialize: initialize,
		submitAnswer: submitAnswer,
		submitVote: submitVote,
		newRound: newRound,
		checkIfUserInGame: checkIfUserInGame,
		getInfoForReconnectingUser: getInfoForReconnectingUser,
		disconnectPlayer: disconnectPlayer
	};
};