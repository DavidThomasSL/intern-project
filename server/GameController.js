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
	var voteNumber;

	// Indicate what gamestate the gamecontroller is currently in
	var POSSIBLE_GAMESTATES = {
		'QUESTION': 1,
		'VOTING': 2,
		'ROUND_RESULTS': 3,
		'FINAL_RESULTS': 4
	};

	/*
		Message Functions pass in on creation from the server
		Allows the gameController to send messages via to server to clients
		deal from current arrays, when card it dealt remove it to stop player getting same cards
	*/

	//Number of white cards a user should always have
	var HANDSIZE = 10;

    var GameState = '0';

	// true if there is a timer running -> checked in updateGameState
	// in the case if everyone submitted and game state has changed -> timer needs to stop
	var timerIsActive = false;
	var count = 30 ;

	/*
		holding the function called on a 1sec interval
		global so that it can be stopped by function stopTimer,
		which is outside of the scope of startTimer
	*/
	var counter;

	// function to initialise the countdown
    var startTimer = function(callback) {

    	count = 30 ;

	    timerIsActive = true;
	    setAllPlayersAbleToSubmit();
		counter = setInterval( function() {

			count -- ;
			if (count < 0) {
				if (GameState === POSSIBLE_GAMESTATES.QUESTION) {
					updateGameState(POSSIBLE_GAMESTATES.VOTING);
				}
				else if (GameState === POSSIBLE_GAMESTATES.VOTING) {
					updateGameState(POSSIBLE_GAMESTATES.ROUND_RESULTS);
				}
				timerIsActive = false;
				// trigger callback so the server sees the time has ran out
				stopTimer();
				callback();
			}

		}, 1000);  // 1000 will  run it every 1 second

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
	var initialize = function(usersInRoom, callback) {

		path.join(__dirname, './BlackWhiteCards.json');

		//Read in the Black and white cards
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				throw err;
			} else {

				//round 1 started in phase 1 of the game: players are submitting their choices

				//set up each user
				var cards = JSON.parse(data);
				blackCardsMaster = cards.blackCards;
				// blackCardsMaster = cards.blackCards.filter(function(card) {
				// 	return (card.pick !== 1);
				// });
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

			updateGameState(POSSIBLE_GAMESTATES.FINAL_RESULTS);

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

			updateGameState(POSSIBLE_GAMESTATES.QUESTION);

			data = {
				players: players,
				roundQuestion: round.question,
				round: roundCount,
				maxRounds: maxRounds,
				gameIsOver: false
			};
		}
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


		return question;
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

		//TO DO: before submitting check that the player hasn't submitted yet

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
			answersText.forEach(function (answer){
				updateHand(playerId, answer);
			});

			//check if everyone submitted and sends back all the currently submitted answers
			var allChoicesSubmitted;

			if (currentRound.answers.length === getNumOfConnectedPlayers()) {
				// change gametsate to the next stage
				updateGameState(POSSIBLE_GAMESTATES.VOTING);

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

		// TO DO : before submitting a vote check that the player hasn't already submitted one

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
				if (JSON.stringify(answer.answersText) === JSON.stringify(votedForText)) {
					answer.playersVote.push(submittingPlayer.name);
				}

				//Build result object for each answer submitted
				players.forEach(function(pl) {
					if (pl.uId === answer.player.uId) {

						var result = {
							player: pl,
							answersText: answer.answersText,
							playersWhoVotedForThis: answer.playersVote,

						};

						currentRound.results.push(result);
					}
				});
			});

			var allVotesSubmitted;

			//check if everyone voted
			if (countVotes(currentRound) === getNumOfConnectedPlayers()) {

				//change the gamestate to the next stage
				updateGameState(POSSIBLE_GAMESTATES.ROUND_RESULTS);

				voteNumber = 0 ;
				allVotesSubmitted = true;

			} else {
				voteNumber = countVotes(currentRound);
				allVotesSubmitted = false;
			}

			callback({
				res: currentRound.results,
				allVotesSubmitted: allVotesSubmitted,
				voteNumber: countVotes(currentRound)
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
		var lastFullRound;

		var currentRound = rounds[roundCount - 1];

		// Tell controller player is now active again
		players.forEach(function(playerInGame) {
			if (playerInGame.uId === userId) {
				player = playerInGame;
			}
		});

		player.connectedToServer = true;

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
				maxRounds: maxRounds,
				countdown: count
			}
		};

		if (lastFullRound !== undefined) {
			results = lastFullRound.results;
		} else results = [];

		var roundData = {
			eventName: "GAME playerRoundResults",
			data: {
				results: results,
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
		data.push(questionData);
		data.push(userHand);

		callback(routingInfo, data);

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

	/*
	update to the next GameState depending on the current state
	*/
	var updateGameState = function(wantedState) {
		GameState = wantedState;

		if ( timerIsActive ) {
			stopTimer();
		}

		if (GameState === POSSIBLE_GAMESTATES.ROUND_RESULTS) {

			var currentRound = rounds[rounds.length - 1];

			//add the points to the players for each vote they received
			currentRound.answers.forEach(function(answer) {
				for (var i = 0; i < answer.playersVote.length; i++) {
					addPoints(answer.player.uId);
				}
			});

			voteNumber = 0 ;

			// Update every player's rank in the room
			setRank();

		}

		 else if (GameState === POSSIBLE_GAMESTATES.VOTING) {
			players.forEach(function(pl) {

				if (pl.hasSubmitted === false) {
					pl.hasSubmitted = true;
				}
			});

		}
	};

	// TO DO : check game state before every move!

	function setAllPlayersAbleToSubmit() {
		players.forEach(function(player) {
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

		//sorting the players and getting their ranks
		players.sort(function(a, b) {return parseInt(b.points) - parseInt(a.points);});
		var ranks = players.slice().map(function(v){
			return players.indexOf(v)+1;
		});
		//assigning ranks to players
		for (var i = 0; i < players.length; i++) {
			players[i].rank = ranks[i];
		}
		//if players have the same score they are given the same rank
		for (var j=1; j<players.length; j++) {
			if (players[j-1].points === players[j].points) {
				players[j].rank = players[j-1].rank;
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
		updateGameState: updateGameState,
		startTimer: startTimer,
		checkIfUserInGame: checkIfUserInGame,
		getInfoForReconnectingUser: getInfoForReconnectingUser,
		disconnectPlayer: disconnectPlayer
	};
};
