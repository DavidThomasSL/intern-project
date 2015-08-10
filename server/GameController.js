var fs = require('fs');
var path = require('path');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var roundCount = 0;
	var maxRounds = 8;
	var rounds = [];
	var POINTS_PER_VOTE = 50;
	var blackCardsMaster = [];
	var whiteCardsMaster = [];
	var blackCardsCurrent = [];
	var whiteCardsCurrent = [];
	var FAKE_ANSWERS = 3; //Number of fake answers to put in every round
	var HANDSIZE = 10; //Number of white cards a user should always have
	var BOT_NUMBER = 0;
	var bots = [];

	// Indicate what gamestate the gamecontroller is currently in
	var POSSIBLE_GAMESTATES = {
		'QUESTION': 1,
		'VOTING': 2,
		'ROUND_RESULTS': 3,
		'FINAL_RESULTS': 4
	};
	var GAMESTATE;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(room, callback) {

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

				room.usersInRoom.forEach(function(user) {
					setupPlayer(user);
				});

				BOT_NUMBER = room.botNumber;

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

			GAMESTATE = POSSIBLE_GAMESTATES.FINAL_RESULTS;

			data = {
				gameIsOver: true
			};

		} else {

			// Create new round
			roundCount += 1;

			var round = {
				count: roundCount,
				question: getRoundQuestion(),
				answers: [],
				results: []
			};

			rounds.push(round);

			GAMESTATE = POSSIBLE_GAMESTATES.QUESTION;

			data = {
				players: players,
				roundQuestion: round.question,
				round: roundCount,
				maxRounds: maxRounds,
				gameIsOver: false
			};
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
				playersVote: [],
				isFake: false
			};

			//Get the current round object, which will hold all the answers for that round
			var currentRound = rounds[rounds.length - 1];
			currentRound.answers.push(ans);

			//Update this players hand with a new card, as they have just played one
			updateHand(playerId, answerText);

			var allChoicesSubmitted;

			//check if everyone submitted and sends back all the currently submitted answers
			if (currentRound.answers.length === getNumOfConnectedPlayers()) {
				// change gametsate to the next stage
				GAMESTATE = POSSIBLE_GAMESTATES.VOTING;

				//allow everyone to vote again
				setAllPlayersAbleToSubmit();

				//add bot answers for people to vote on
				addFakeAnswers(currentRound);

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
		Submit a user vote for an answer

		Answers are the submissiions from users
		Gets the answer this vote is for
		Add points to the player who submitted that answer
		Adds the voting user's name to the list of people who voted for this answer

		If everyone has submitted a vote, will return with All Votes submitted as true,
			which is checked by the server in the callback.

		Return results, an array of objects for each answer that has been submitted
		The result object holds who submitted it, voted for it, the voters rank and points
	 */
	var submitVote = function(playerId, votedForAnswer, callback) {

		var currentRound = rounds[rounds.length - 1];
		var results = [];
		currentRound.results = [];

		var submittingPlayer = getPlayerFromId(playerId);

		if (submittingPlayer.hasSubmitted) {
			// Do nothing
		} else {

			submittingPlayer.hasSubmitted = true;
			// Add the user's vote to the answer
			currentRound.answers.forEach(function(answer) {

				//Find the anwser matching the one selected
				if (answer.player.uId === votedForAnswer.player.uId) {
					answer.playersVote.push(submittingPlayer.name);
				}

				//Build result object for each answer submitted
				players.forEach(function(pl) {
					if (pl.uId === answer.player.uId) {

						var result = {
							player: pl,
							answerText: answer.answerText,
							playersWhoVotedForThis: answer.playersVote,
						};

						currentRound.results.push(result);
					}
				});


				bots.forEach(function(bot) {
					if (bot.uId === answer.player.uId) {

						var result = {
							player: bot,
							answerText: answer.answerText,
							playersWhoVotedForThis: answer.playersVote,
						};

						currentRound.results.push(result);
					}
				});

			});

			var allVotesSubmitted;
			var voteNumber = countVotes(currentRound);

			//check if everyone voted
			if (voteNumber === getNumOfConnectedPlayers()) {

				//add the points to the players for each vote they received
				currentRound.answers.forEach(function(answer) {
					for (var i = 0; i < answer.playersVote.length; i++) {
						addPoints(answer.player.uId);
					}
				});

				// Update every player's rank in the room
				setRank();

				//change the gamestate to the next stage
				GAMESTATE = POSSIBLE_GAMESTATES.ROUND_RESULTS;
				setAllPlayersAbleToSubmit();

				allVotesSubmitted = true;
				voteNumber = 0;

			} else {
				allVotesSubmitted = false;
			}

			callback({
				res: currentRound.results,
				allVotesSubmitted: allVotesSubmitted,
				voteNumber: voteNumber
			});
		}
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
				player = playerInGame;
			}
		});

		player.connectedToServer = true;

		if (GAMESTATE === POSSIBLE_GAMESTATES.QUESTION) {

			if (player.hasSubmitted) {
				routingInfo = "waitQuestion";
			} else {
				routingInfo = "question";
			}

		} else if (GAMESTATE === POSSIBLE_GAMESTATES.VOTING) {

			if (player.hasSubmitted) {
				routingInfo = "waitVote";
			} else {
				routingInfo = "vote";
			}

		} else if (GAMESTATE === POSSIBLE_GAMESTATES.ROUND_RESULTS) {
			routingInfo = "results";

		} else if (GAMESTATE === POSSIBLE_GAMESTATES.FINAL_RESULTS) {
			routingInfo = "endGame";

		}

		var userHand = {
			eventName: "USER hand",
			data: {
				hand: player.hand
			}
		};

		var questionData = {
			eventName: "GAME question",
			data: {
				question: currentRound.question,
				round: currentRound.count,
				maxRounds: maxRounds
			}
		};

		var roundData = {
			eventName: "GAME playerRoundResults",
			data: {
				results: currentRound.results,
				voteNumber: countVotes(currentRound)
			}
		};

		var answerData = {
			eventName: "GAME answers",
			data: {
				answers: currentRound.answers,
			}
		};

		data.push(roundData);
		data.push(answerData);
		data.push(questionData);
		data.push(userHand);

		callback(routingInfo, data);
	};

	/*
		Adds several fake answers (random white cards) to each rounds answers

		Increases the number of responses when not many players present
	*/
	var addFakeAnswers = function(round) {

		for (var i = 0; i < BOT_NUMBER; i++) {

			// Ethier create new bots or use the exisiting ones
			var fakePlayer;
			if (bots.length === i) {
				// Build fake player
				fakePlayer = {
					name: "BOT " + i,
					uId: i,
					hand: dealUserHand(),
					points: 0
				};
				bots.push(fakePlayer);
			} else {
				fakePlayer = bots[i];
			}

			var randomAns = Math.floor(Math.random() * HANDSIZE);

			// Build the submitted answer
			var ans = {
				player: fakePlayer,
				answerText: fakePlayer.hand[randomAns],
				playersVote: [],
				isFake: true,
				rank: "",

			};

			//Get the current round object, which will hold all the answers for that round
			round.answers.push(ans);
		}

	};

	/*
		Given a user id, returns if that user is a player in this game
	*/
	var checkIfUserInGame = function(userId) {
		var inRoom = false;
		players.forEach(function(player) {
			if (player.uId === userId) {
				inRoom = true;
			}
		});
		return inRoom;
	};

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
	};

	function setAllPlayersAbleToSubmit() {
		players.forEach(function(player) {
			player.hasSubmitted = false;
		});
	}

	/*
		add 50 points to player -> called on each vote
		Also adds points to the bots if someone voted for them
	*/
	var addPoints = function(playerId) {
		players.forEach(function(player) {
			if (player.uId === playerId) {
				player.points += POINTS_PER_VOTE;
			}
		});
		bots.forEach(function(bot) {
			if (bot.uId === playerId) {
				bot.points += POINTS_PER_VOTE;
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

		var allPlayers = players.concat(bots);

		//sorting the players and getting their ranks
		allPlayers.sort(function(a, b) {
			return parseInt(b.points) - parseInt(a.points);
		});
		var ranks = allPlayers.slice().map(function(v) {
			return allPlayers.indexOf(v) + 1;
		});
		//assigning ranks to players
		for (var i = 0; i < allPlayers.length; i++) {
			allPlayers[i].rank = ranks[i];
		}
		//if players have the same score they are given the same rank
		for (var j = 1; j < players.length; j++) {
			if (allPlayers[j - 1].points === allPlayers[j].points) {
				allPlayers[j].rank = allPlayers[j - 1].rank;
			}
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
			name: user.name,
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
