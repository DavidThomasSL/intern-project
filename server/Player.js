function Player(user, cardController) {

	var self = this;
	self.uId = user.uId;
	self.name = user.name;
	self.hand = [];
	self.hasSubmitted = false;
	self.points = 0;
	self.rank = "";
	self.connectedToServer = true;
	self.isBot = false;
	self.cardController = cardController;

	self.dealHand = function(handSize) {
		for (var i = 0; i < handSize; i++) {
			addCardToHand();
		}
	};

	self.updateHand = function(usedCard) {

		// Remove used card from hand
		self.hand = self.hand.filter(function(card) {
			if (card !== usedCard)
				return card;
		});

		addCardToHand();
	};

	self.addPoints = function(points) {
		self.points = self.points + points;
	};

	self.removePoints = function(points) {
		self.points = self.points - points;
	};

	// Used to get a random card from the hand
	// Called by bots
	self.pickRandomCard = function() {

		// Pick Random one
		var index = Math.floor(Math.random() * self.hand.length);
		var randomAns = self.hand[index];

		return randomAns;
	};

	function addCardToHand() {
		var card = self.cardController.getWhiteCard();
		self.hand.push(card);
	}
}

module.exports = Player;
