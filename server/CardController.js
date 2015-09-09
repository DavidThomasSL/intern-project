var fs = require('fs');
var path = require('path');
var Q = require('q');

function CardController() {

	var self = this;

	//the private constant lists containing all the cards read from the json
	var whiteCardsMaster = [];
	var blackCardsMaster = [];

	//the private changing lists where cards are removed once they have been used
	var whiteCardsCurrent = [];
	var blackCardsCurrent = [];

	/*
		Get a Random black card and return it
		Removes the black card from the set of black cards to not be played again
	*/
	self.getQuestion = function() {

		//when we get to the end of the black cards, refresh the list
		if (blackCardsCurrent.length < 1){
			blackCardsCurrent = blackCardsMaster.slice();
		}

		var index = Math.floor((Math.random() * blackCardsCurrent.length));
		var question = blackCardsCurrent[index];
		blackCardsCurrent.splice(index, 1);

		return question;
	};

	self.getWhiteCard = function() {

		//when we get to the end of the white cards, refresh the list
		if (whiteCardsCurrent.length < 1) {
			whiteCardsCurrent = whiteCardsMaster.slice();
		}

		var index = Math.floor((Math.random() * whiteCardsCurrent.length));
		card = whiteCardsCurrent[index];
		whiteCardsCurrent.splice(index, 1);

		return card;
	};

	/*
		Load the Black and White Cards from Json
	*/
	self.init = function() {

		var deferred = Q.defer();

		path.join(__dirname, './BlackWhiteCards.json');
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				deferred.reject(new Error(err));
			} else {
				var cards = JSON.parse(data);
				whiteCardsMaster = cards.whiteCards;
				blackCardsMaster = cards.blackCards;
				whiteCardsCurrent = whiteCardsMaster.slice();
				blackCardsCurrent = blackCardsMaster.slice();

				// Call back to gameController once files are loaded
				deferred.resolve();
			}
		});

		return deferred.promise;
	};
}

module.exports = CardController;
