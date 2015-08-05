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

	// Message Functions pass in on creation from the server
	// Allows the gameController to send messages via to server to clients
	//deal from current arrays, when card it dealt remove it to stop player getting same cards

	//Number of white cards a user should always have
	var HANDSIZE = 7;

    /*
    GameState:
        0 : game hasn't started yet
        _1 : game started, round _, everyone has to submit a choice
        _2 : round _, everyone has to submit a vote
        _3 : round _, votes are in
    */
    var GameState = '0';
    var GameStateHasChanged = false
	var count = 30;

    function startTimer () {

    	GameStateHasChanged = false;

	    count = 30;

		var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

	function timer() {

		count --;
		if ( count <= 0 ) {
			clearInterval(counter);
			if ( GameStateHasChanged === true ) {

			     //counter ended, do something here
			    return;
			}
			else console.log("changing gameState");

		}
		console.log(count);
	  //Do code for showing the number of seconds here
	}
}

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
				updateGameState();

				startTimer();

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

		roundCount += 1;
		updateGameState();
		if (gameOver) {
			roundCount = -1;
		}

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
			round: roundCount,
			gameIsOver: gameOver
		});
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

	//finish game and send back final scores
	var finishGame = function(callback) {

		updateGameState();

		var results = [];

		players.forEach(function(pl){
			var result = {
				playerId: pl.uId,
				playerName : pl.name,
				score: pl.points,
				rank: pl.rank
			};
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
			name : user.username,
			hand: dealUserHand(),
			points: 0,
			rank: ""
		};

		players.push(player);
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

		//TO DO: before submitting check that the player hasn't submitted yet


		//FInd the player who submmited this
		players.forEach(function(pl) {
			if (pl.uId === playerId) {
				player = pl;
			}
		});

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

			// update game state to voting stage of the current round
			updateGameState();

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



		// TO DO : before submitting a vote check that the player hasn't already submitted one

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
		if (countVotes(currentRound) === players.length) {

			// update game state to current round finished - seeing voting results
			updateGameState();

			//add the points to the players for each vote they received
			currentRound.answers.forEach(function(answer) {
				for (var i = 0; i < answer.playersVote.length; i++) {
					addPoints(answer.player.uId);
				}
			});

			// Update every player's rank in the room
			setRank();

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
	update to the next GameState depending on the current state
	*/
	var updateGameState = function() {
		if ( GameState === '0' ) {
			GameState = '11'
		} else if ( GameState === rounds.length + '1' ) {
			GameState = rounds.length + '2';
		} else if ( GameState === rounds.length + '2' ) {
			GameState = rounds.length + '3';
		} else if ( GameState === rounds.length + '3' ) {
			GameState = (rounds.length+1) + '1';
		}
		GameStateHasChanged = true ;
	};

	// TO DO : check game state before every move!


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
