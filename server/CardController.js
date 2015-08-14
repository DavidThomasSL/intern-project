var fs = require('fs');
var path = require('path');

function CardController(afterLoad) {

	var self = this;
	self.whiteCards = [];
	self.blackCards = [];

	// Load the files, call gamecontroller afterwards
	init(afterLoad);

	/*
		Get a Random black card and return it
		Removes the black card from the set of black cards to not be played again
	*/
	self.getQuestion = function() {

		var index = Math.floor((Math.random() * self.blackCards.length));
		var question = self.blackCards[index];
		self.blackCards.splice(index, 1);

		return question;
	};

	self.getWhiteCard = function() {
		// removing dealt card from card list
		var index = Math.floor((Math.random() * self.whiteCards.length));
		card = self.whiteCards[index];
		self.whiteCards.splice(index, 1);

		return card;
	};

	/*
		Load the Black and White Cards from Json
	*/
	function init(afterLoad) {
		path.join(__dirname, './BlackWhiteCards.json');
		fs.readFile(__dirname + '/BlackWhiteCards.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				var cards = JSON.parse(data);
				self.whiteCards = cards.whiteCards;
				self.blackCards = cards.blackCards;

				// Call back to gameController once files are loaded
				afterLoad();
			}
		});
	}
}

module.exports = CardController;
