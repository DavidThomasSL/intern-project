function Player(user) {

	var self = this;
	self.uId = user.uId;
	self.name = user.name;
	self.hand = [];
	self.hasSubmitted = false;
	self.points = 0;
	self.rank = "";
	self.connectedToServer = true;

	self.dealUserHand = function(handSize, whiteCards) {
		for (var i = 0; i < handSize; i++) {
			addCardToHand(whiteCards);
		}
	};

	self.updateHand = function(usedCard, whiteCards) {

		// Remove used card from hand
		self.hand = self.hand.filter(function(card) {
			if (card !== usedCard)
				return card;
		});

		addCardToHand(whiteCards);
	};

	self.addPoints = function(points) {
		self.points = self.points + points;
	};

	self.removePoints = function(points) {
		self.points = self.points - points;
	};

	function addCardToHand(whiteCards) {

		// removing dealt card from card list
		var index = Math.floor((Math.random() * whiteCards.length));
		card = whiteCards[index];
		whiteCards.splice(index, 1);

		self.hand.push(card);
	}
}

module.exports = Player;
