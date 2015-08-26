var fs = require('fs');
var path = require('path');

var Player = require('./Player');
var CardController = require('./CardController');

module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var bots = [];

	var cardController; // holds the white and black cards
	var rounds = [];

	var voteNumber;
	var roundCount = 0;

	var MAX_ROUNDS = 8;
	var BOT_NUMBER = 0;
	var POINTS_PER_VOTE = 50;
	var HAND_REPLACE_COST = 50;
	var HANDSIZE = 10; //Number of white cards a user should always have
	var animationTime = 5; //time each animation runs for on the client

	// Indicate what gamestate the gamecontroller is currently in
	var POSSIBLE_GAMESTATES = {
		'QUESTION': 1,
		'VOTING': 2,
		'ROUND_RESULTS': 3,
		'FINAL_RESULTS': 4
	};

	var GameState = '0';

	// true if there is a timer running -> checked in updateGameState
	// in the case if everyone submitted and game state has changed -> timer needs to stop
	var timerIsActive = false;
	var count;

	/*
		holding the function called on a 1sec interval
		global so that it can be stopped by function stopTimer,
		which is outside of the scope of startTimer
	*/
	var counter;

	// function to initialise the countdown
	var startTimer = function(callback) {

		count = 60;
		if (GameState === POSSIBLE_GAMESTATES.VOTING) {
			/*
				if we are on the voting page
				the answers appear one at a time and we have to also wait
				until all answers finished their animation
				in order to start the timer
			*/
			count += animationTime * (rounds[roundCount - 1].answers.length);
		}

		timerIsActive = true;
		setAllPlayersAbleToSubmit();
		counter = setInterval(function() {

			count--;
			if (count < 0) {
				if (GameState === POSSIBLE_GAMESTATES.QUESTION) {
					updateGameState(POSSIBLE_GAMESTATES.VOTING);
				} else if (GameState === POSSIBLE_GAMESTATES.VOTING) {
					updateGameState(POSSIBLE_GAMESTATES.ROUND_RESULTS);
				}
				timerIsActive = false;
				// trigger callback so the server sees the time has ran out
				stopTimer();

				// if no votes have been submitted then need to build a new results array for the results screen
				// this results object will just contain the players and what answers they submitted with a blank
				// playersWhoVotedForThis array.
				var currentResults = rounds[roundCount - 1].results;
				if (currentResults.length === 0) {
					currentResults = buildBlankResults();
				}
				var roundData = {
					results: currentResults,
					voteCounter: 0
				};
				callback(roundData);
			}

		}, 1000); // 1000 will  run it every 1 second

	};

	var buildBlankResults = function() {

		var currentRound = rounds[roundCount - 1];
		var results = [];

		currentRound.answers.forEach(function(currentAnswer) {
			var result = {
				player: currentAnswer.player,
				answersText: currentAnswer.answersText,
				playersWhoVotedForThis: []
			};
			results.push(result);
		});
		return results;
	};

	/*
		function to stop the counter
		is called from updateGameState function
		when there is an active timer
		but the game state has changed
		-> aka. everyone submitted so the timer needs to stop
	*/
	var stopTimer = function() {

		clearInterval(counter);

	};

	/*
		Called by the server when a game starts
	*/
	var initialize = function(room, callback) {

		cardController = new CardController(function() {
			room.usersInRoom.forEach(function(user) {
				setupPlayer(user);
			});

			room.botsInRoom.forEach(function(bot) {
				setupBot(bot);
			});

			BOT_NUMBER = room.botsInRoom.length;
			MAX_ROUNDS = room.numRounds;

			//Call back to server after finish setting up
			callback();
		});
	};

	/*
		Moves the gameController to the next round
		FInd out if the game is over or should continue

		Returns to the server new round information
	*/
	var newRound = function(callback) {

		var gameOver = (roundCount >= MAX_ROUNDS);
		var data;

		// Check if game over
		if (gameOver) {

			updateGameState(POSSIBLE_GAMESTATES.FINAL_RESULTS);

			data = {
				gameIsOver: true
			};

		} else {
			// Create new round
			roundCount += 1;

			var round = {
				count: roundCount,
				question: cardController.getQuestion(),
				answers: [],
				results: []
			};

			rounds.push(round);

			updateGameState(POSSIBLE_GAMESTATES.QUESTION);

			data = {
				players: players,
				roundQuestion: round.question,
				round: roundCount,
				handReplaceCost: HAND_REPLACE_COST,
				maxRounds: MAX_ROUNDS,
				gameIsOver: false
			};
		}
		callback(data);
	};


	/*
		Submit a user answer to a question

		Adds the user's answer to the round answers, with their details,
		the answer text and an (empty) list of who voted for it.

		Updates the users hand to give them a new card

		Checks if everyone has submitted their answers, and if tells the server to route them
		to next stage

	 */
	var submitAnswer = function(playerId, answersText, callback) {

		var submittingPlayer = getPlayerFromId(playerId);

		if (submittingPlayer.hasSubmitted) {
			//can't submit twice
		} else {

			submittingPlayer.hasSubmitted = true;

			// Build the submitted answer
			var ans = {
				player: submittingPlayer,
				answersText: answersText,
				playersVote: []
			};

			//Get the current round object, which will hold all the answers for that round
			var currentRound = rounds[rounds.length - 1];
			currentRound.answers.push(ans);

			//Update this players hand with a new card, as they have just played one
			// Loop throughas there can be multiple cards played on one answer
			answersText.forEach(function(answer) {
				submittingPlayer.updateHand(answer);
			});

			var allChoicesSubmitted;

			//check if everyone submitted and sends back all the currently submitted answers
			if (currentRound.answers.length >= getNumOfConnectedPlayers()) {

				//add bot answers for people to vote on
				addFakeAnswers(currentRound);

				// Move to the voting stage of the game
				updateGameState(POSSIBLE_GAMESTATES.VOTING);

				allChoicesSubmitted = true;

			} else {
				allChoicesSubmitted = false;
			}

			callback({
				answers: currentRound.answers,
				allChoicesSubmitted: allChoicesSubmitted,
				submittingPlayersNewHand: submittingPlayer.hand
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

		// TO DO : before submitting a vote check that the player hasn't already submitted one

		var currentRound = rounds[rounds.length - 1];
		var results = [];
		var submittingPlayer = getPlayerFromId(playerId);

		currentRound.results = [];

		if (submittingPlayer.hasSubmitted) {

			// Do nothing
		} else {

			submittingPlayer.hasSubmitted = true;
			// Add the user's vote to the answer
			currentRound.answers.forEach(function(answer) {

				//Find the anwser matching the one selected
				if (answer.player.uId === votedForAnswer.player.uId) {

					answer.playersVote.push(submittingPlayer);
				}

				// Build result object for each answer submitted
				// Also works for bots
				var answerPlayer = getPlayerFromId(answer.player.uId);
				var result = {};

				// Only add result if player was found with that id
				if (answerPlayer !== undefined) {

					result = {
						player: answerPlayer,
						answersText: answer.answersText,
						playersWhoVotedForThis: answer.playersVote,

					};

					currentRound.results.push(result);
				}
			});

			var allVotesSubmitted;
			var voteNumber = countVotes(currentRound);

			//check if everyone voted
			if (isVotingComplete(currentRound)) {

				// Change the gamestate to the next stage
				// Add the points for the game
				updateGameState(POSSIBLE_GAMESTATES.ROUND_RESULTS);

				voteNumber = 0;
				allVotesSubmitted = true;

			} else {
				allVotesSubmitted = false;
			}

			callback({
				res: currentRound.results,
				currentVotes: currentRound.results,
				allVotesSubmitted: allVotesSubmitted,
				voteNumber: voteNumber
			});
		}
	};

	/*
		Return if voting stage is ready to end

		If the number of votes submitted is equal to or more than
		the number of answers submitted

		Works if not all players submit an answer, we don't have to wait to time out in that case
	*/
	function isVotingComplete(round) {

		var maxPosVotes = getNumOfConnectedPlayers(); // maximum number of votes possible to have

		players.forEach(function(player) {

			// check if a player has NOT submitted
			if (!player.hasSubmitted) {

				// check if it possible for them to submit (are there answers other than their own to vote on?)
				availableAns = round.answers.filter(function(ans) {
					return ans.player.uId !== player.uId;
				});

				if (availableAns.length === 0) {
					// this player cannot vote for any choices,
					// reduce number of max possible votes
					maxPosVotes--;
				}
			}
		});

		return maxPosVotes === countVotes(round);
	}


	/*
		Catches a reconnecting user up with the current game status

		Sends the
			routing information (what page are we on)
			game information (game question, user hand)
			round information (current votes, etc for table)
	*/

	var getInfoForReconnectingUser = function(user, testing, callback) {

		//GET round information
		var routingInfo = "";
		var gameData = {};
		var userData = {};
		var data = [];
		var player;
		var lastFullRound;

		var currentRound = rounds[roundCount - 1];

		player = getPlayerFromId(user.uId);

		if (!user.isObserver) {
			player.connectedToServer = true;
		}

		if (GameState === POSSIBLE_GAMESTATES.QUESTION) {

			lastFullRound = rounds[roundCount - 2];

			if (player.hasSubmitted) {
				routingInfo = "waitQuestion";
			} else {
				routingInfo = "question";
			}

		} else if (GameState === POSSIBLE_GAMESTATES.VOTING) {

			lastFullRound = rounds[roundCount - 2];

			if (player.hasSubmitted) {
				routingInfo = "waitVote";
			} else {
				routingInfo = "vote";
			}

		} else if (GameState === POSSIBLE_GAMESTATES.ROUND_RESULTS) {

			lastFullRound = rounds[roundCount - 1];

			routingInfo = "results";

		} else if (GameState === POSSIBLE_GAMESTATES.FINAL_RESULTS) {

			lastFullRound = rounds[roundCount - 1];

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
				handReplaceCost: HAND_REPLACE_COST,
				maxRounds: MAX_ROUNDS,
				countdown: count
			}
		};

		var playerQuestionData = {
			eventName: "PLAYER question",
			data: {
				question: currentRound.question
			}
		};

		if (lastFullRound !== undefined) {
			results = lastFullRound.results;
		} else results = [];

		var roundData = {
			eventName: "GAME playerRoundResults",
			data: {
				results: results,
				currentVotes: currentRound.results,
				voteNumber: countVotes(currentRound)
			}
		};

		var answerData = {
			eventName: "GAME answers",
			data: {
				answers: currentRound.answers,
				countdown: count
			}
		};

		data.push(roundData);
		data.push(answerData);

		if (testing !== undefined) {

			var timeoutData = {
				eventName: "GAME timeout",
				data: {
					timeout: 0
				}
			};
			data.push(timeoutData);
		}


		data.push(questionData);
		data.push(playerQuestionData);
		data.push(userHand);

		callback(routingInfo, data);
	};

	/*
		Adds several fake answers (random white cards) to each rounds answers
		Increases the number of responses when not many players present
	*/
	var addFakeAnswers = function(round) {

		var answersToPick = round.question.pick;
		var ans;

		// Get answer from each bot
		bots.forEach(function(bot) {
			var randomAnswers = [];
			var randomAns;

			for (var j = 0; j < answersToPick; j++) {
				randomAns = bot.pickRandomCard();
				bot.updateHand(randomAns);
				randomAnswers.push(randomAns);
			}

			// Build the submitted answer
			ans = {
				player: bot,
				answersText: randomAnswers,
				playersVote: [],
				rank: ""
			};

			round.answers.push(ans);
		});
	};

	/*
		Given a user id, returns if that user is a player in this game
	*/
	var checkIfUserInGame = function(userId) {
		if (getPlayerFromId(userId) !== undefined) {
			return true;
		}
		return false;
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

	/*
	update to the next GameState depending on the current state
	*/
	var updateGameState = function(wantedState) {
		GameState = wantedState;

		if (timerIsActive) {
			stopTimer();
		}

		if (GameState === POSSIBLE_GAMESTATES.ROUND_RESULTS) {

			var currentRound = rounds[rounds.length - 1];

			//add the points to the players for each vote they received
			currentRound.answers.forEach(function(answer) {
				for (var i = 0; i < answer.playersVote.length; i++) {
					answer.player.addPoints(POINTS_PER_VOTE);
				}
			});

			penaliseNonVotingPlayers(currentRound.answers);

			voteNumber = 0;

			// Update every player's rank in the room
			setRank();

		} else if (GameState === POSSIBLE_GAMESTATES.VOTING) {
			players.forEach(function(pl) {
				if (pl.hasSubmitted === false) {
					pl.hasSubmitted = true;
				}
			});
		}
	};

	var replaceHand = function(userId, cardsToReplace, callback) {
		var newHand;
		var currentPlayer = getPlayerFromId(userId);

		//replace all requested cards with new ones and remove points
		currentPlayer.replaceCards(cardsToReplace);
		currentPlayer.removePoints(HAND_REPLACE_COST);

		//updating the player ranks with the new point values
		setRank();

		//need also the send new point values back, doing this through playerRoundResults
		var currentResults = rounds[rounds.length - 1].results;
		callback(currentPlayer.hand, currentResults);
	};

	// TO DO : check game state before every move!

	function setAllPlayersAbleToSubmit() {
		players.forEach(function(player) {
			player.hasSubmitted = false;
		});
	}

	/*
		finds players haven't voted in a certain round's answer set and takes points off them
	*/
	var penaliseNonVotingPlayers = function(answers) {
		var playersWhoHaventVoted = players.slice();
		var currentAnswers = answers.slice();
		currentAnswers.forEach(function(answer) {
			answer.playersVote.forEach(function(votingPlayer) {
				playersWhoHaventVoted = playersWhoHaventVoted.filter(function(iteratedPlayer) {
					return (iteratedPlayer.uId !== votingPlayer.uId);
				});
			});
		});
		playersWhoHaventVoted.forEach(function(player) {
			player.removePoints(POINTS_PER_VOTE);
		});
	};

	/*
		count the overall votes in this round
	*/
	var countVotes = function(currentRound) {
		var votes = 0;

		if (currentRound !== undefined) {
			currentRound.answers.forEach(function(option) {
				votes += option.playersVote.length;
			});
		}
		return votes;
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
		for (var j = 1; j < allPlayers.length; j++) {
			if (allPlayers[j - 1].points === allPlayers[j].points) {
				allPlayers[j].rank = allPlayers[j - 1].rank;
			}
		}
	};

	/*
		Sets up a player with a user id, a new hand and 0 points
		Adds them to the player list
	*/
	var setupPlayer = function(user) {
		var player = new Player(user, cardController);
		if (user.isObserver === true) {
			player.connectedToServer = false;
		}

		// Removes the cards from list of possible cards for other player
		player.dealHand(HANDSIZE);
		players.push(player);
	};

	var setupBot = function(bot) {
		var botPlayer = new Player(bot, cardController);
		botPlayer.dealHand(HANDSIZE);
		bots.push(botPlayer);
	};

	var disconnectPlayer = function(playerId) {
		var player = getPlayerFromId(playerId);
		if (player !== undefined) {
			player.connectedToServer = false;
		}
	};

	var getPlayerFromId = function(playerId) {
		var player;
		players.forEach(function(pl) {
			if (pl.uId === playerId) {
				player = pl;
			}
		});

		//check if the id is for a bot
		if (player === undefined) {
			bots.forEach(function(bt) {
				if (bt.uId === playerId) {
					player = bt;
				}
			});
		}

		return player;
	};

	return {
		initialize: initialize,
		submitAnswer: submitAnswer,
		submitVote: submitVote,
		replaceHand: replaceHand,
		newRound: newRound,
		updateGameState: updateGameState,
		startTimer: startTimer,
		checkIfUserInGame: checkIfUserInGame,
		getInfoForReconnectingUser: getInfoForReconnectingUser,
		disconnectPlayer: disconnectPlayer
	};
};
