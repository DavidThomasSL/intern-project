var expect = require("expect.js");
var sinon = require("sinon");
var Player = require("../../../server/Player");

describe('Player', function() {

	var fakeSocket;
	var fakeCardController;
	var fakeUser;
	var socketSpy;

	var player;

	beforeEach(function() {

		fakeUser = {
			uId: 1,
			name: "John"
		};


		// Create closure that returns a getWhiteCard Func
		// Increments the card counter index each time getWhiteCard is called
		// Can create unique cards this way
		fakeCardController = function() {
			var index = 0;
			var getWhiteCard = function() {
				index++;
				return "White card " + index;
			};
			return {
				getWhiteCard: getWhiteCard
			};
		}();

		player = new Player(fakeUser, fakeCardController);
	});


	describe('Constructor', function() {
		it("uId is set as the user's uiD", function() {
			expect(player.uId).to.be(1);
		});

		it("Name is set as the user's name", function() {
			expect(player.name).to.be("John");
		});

		it("Hand is empty", function() {
			expect(player.hand).to.eql([]);
		});

		it("hasSubmitted is false", function() {
			expect(player.hasSubmitted).to.be(false);
		});

		it("points to be 0", function() {
			expect(player.points).to.be(0);
		});

		it("points to be ''", function() {
			expect(player.rank).to.be("");
		});

		it("connectedToServer to be true", function() {
			expect(player.connectedToServer).to.be(true);
		});

		it("cardController to be set as the global card controller", function() {
			expect(player.cardController).to.eql(fakeCardController);
		});
	});

	describe('Functions', function() {

		it("can add a card to the users hand", function() {

			var fakeCard = {
				text: "white card"
			};

			// create a stub for the card controller to get a white card
			// can check if it was called, and return a value for the card to put in the hand
			var getWhiteCardStub = sinon.stub(fakeCardController, "getWhiteCard", function() {
				return fakeCard;
			});

			expect(player.hand.length).to.be(0);

			player._addCardToHand();

			expect(getWhiteCardStub.called).to.be(true);
			expect(player.hand.length).to.be(1);

			getWhiteCardStub.restore();
		});

		it('can deal a hand of n cards', function() {

			var handSize = 6;

			expect(player.hand.length).to.be(0);
			player.dealHand(handSize);
			expect(player.hand.length).to.be(handSize);
		});

		it('can update hand given a used card', function() {

			var fakeCard = "White card 4";
			var handSize = 10;


			// create a stub for the card controller to get a white card
			// can check if it was called, and return a value for the card to put in the hand
			var getWhiteCardStub = sinon.stub(fakeCardController, "getWhiteCard", fakeCardController.getWhiteCard);

			player.dealHand(handSize);

			player.updateHand(fakeCard);

			expect(getWhiteCardStub.called).to.be(true);
			expect(player.hand.length).to.be(handSize);
			expect(player.hand.indexOf(fakeCard)).to.be(-1); // old card not in the hand

		});

		it('returns an error if the card is not found, keeps hand the same', function() {

			var fakeCard = "White cardzzz!";
			var handSize = 10;

			// create a stub for the card controller to get a white card
			// can check if it was called, and return a value for the card to put in the hand
			var getWhiteCardStub = sinon.stub(fakeCardController, "getWhiteCard", fakeCardController.getWhiteCard);

			player.dealHand(handSize);

			var err = player.updateHand(fakeCard);

			expect(getWhiteCardStub.called).to.be(true);
			expect(player.hand.length).to.be(handSize);
			expect(err.message).to.be("Cannot replace card, \"" + fakeCard + "\" not found in hand");
		});

		it('can remove points from player', function() {
			player.removePoints(10);
			expect(player.points).to.be(-10);
		});

		it('can add points to player', function() {
			player.addPoints(10);
			expect(player.points).to.be(10);
		});

		it('can get a random card from the player', function() {

			var handSize = 10;
			player.dealHand(handSize);

			var card = player.pickRandomCard();

			expect(player.hand.indexOf(card)).not.to.be(-1); // card should be in the hand
			expect(player.hand.length).to.be(handSize); // card still in hand

			player.updateHand(card);

			expect(player.hand.indexOf(card)).to.be(-1); // got rid of random card
		});

		it('can replace >1 cards when required', function() {

			var handSize = 10;
			var numToReplace = 3;
			var toReplace = [];
			var pointsToReplace = 10;
			player.dealHand(handSize);

			// get some random cards to replace
			for (var i = 0; i < numToReplace; i++) {
				toReplace.push(player.pickRandomCard());
			}

			player.replaceCards(toReplace, pointsToReplace);

			// check all the cards were removed
			for (i = 0; i < numToReplace; i++) {
				expect(player.hand.indexOf(toReplace[i])).to.be(-1);
			}

			// check we still have (handsize) cards
			expect(player.hand.length).to.be(handSize);
		});
	});
});
