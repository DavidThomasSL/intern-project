module.exports = function(data) {

	var players = []; //{userId: 123, hand: {} }
	var round = 0;

	/*
		Called by the server when a game starts
	*/
	var initialize = function(usersInRoom, callback) {
		round = 0;


		usersInRoom.forEach(function(user) {
			var player = {
				uId: user.uId,
				hand: dealUserHand(),
				points: 0
			};

			players.push(player);
		});

		callback({
			players: players,
			roundQuestion: getRoundQuestion(),
			round: round
		});

		// return {
		// 	players: players,
		// 	roundQuestion: getRoundQuestion(),
		// 	round: round
		// };
	};

	/*
		Returns a random questions
	*/
	var getRoundQuestion = function() {
		return "__ Helps me sleep at night";
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
