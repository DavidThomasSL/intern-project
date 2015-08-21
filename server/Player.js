function Player(user, cardController) {

	var self = this;
	self.uId = user.uId;
	self.name = user.name;
	self.image = user.image;
	self.hand = [];
	self.hasSubmitted = false;
	self.points = 0;
	self.rank = "";
	self.connectedToServer = true;
	self.cardController = cardController;

	self.dealHand = function(handSize) {
		for (var i = 0; i < handSize; i++) {
			self._addCardToHand();
		}
	};

	self.updateHand = function(usedCard) {

		var newCard = self.cardController.getWhiteCard();

		//if the card is found in the users hand then replace it with a new one
		var indexOfUsedCard = self.hand.indexOf(usedCard);
		if (indexOfUsedCard !== -1) {
			self.hand[indexOfUsedCard] = newCard;
		} else {
			return new Error("Cannot replace card, \"" + usedCard + "\" not found in hand");
		}

	};

	self.replaceCards = function (cardsToReplace, cardReplaceCost) {

		cardsToReplace.forEach(function(cardToReplace) {
			self.updateHand(cardToReplace);
			self.removePoints(cardReplaceCost);
		});
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

	self._addCardToHand = function() {
		var card = self.cardController.getWhiteCard();
		self.hand.push(card);
	};

	self.toString = function() {
		return {
			uId: self.uId,
			name: self.name,
			hand: self.hand,
			hasSubmitted: self.hasSubmitted
		};
	};
}

module.exports = Player;
