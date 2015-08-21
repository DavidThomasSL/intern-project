var expect = require("expect.js");
var sinon = require("sinon");
var User = require("../../../server/User");

describe('User', function() {

	var fakeSocket;
	var user;
	var socketSpy;

	beforeEach(function() {
		socketSpy = sinon.spy();
		fakeSocket = {
			emit: function(eventName, data) {
				socketSpy(eventName, data);
			},
			id: 1
		};
		user = new User(fakeSocket);
	});

	describe('constructor', function() {

		it('should have a default id matching the uuid regex', function() {
			expect(user.uId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
		});

		it('should have socket attached', function() {
			expect(user.socket).not.to.be.empty();
		});

		it('name should be undefined', function() {
			expect(user.name).to.be(undefined);
		});

		it('room id should be empty string', function() {
			expect(user.roomId).to.equal("");
		});

		it('image should be empty string', function() {
			expect(user.image).to.equal("");
		});

		it('ready to proceed should be false', function() {
			expect(user.readyToProceed).to.be(false);
		});
	});

	describe('Functions', function() {

		it('get user details should return all and correct user details', function() {
			var userDetails = user.getUserDetails();

			expect(Object.keys(userDetails).length).to.be(5);
			expect(userDetails.uId).not.to.be.empty();
			expect(userDetails.socket).to.be(undefined);
			expect(user.readyToProceed).to.be(false);
			expect(user.roomId).to.equal("");
			expect(user.image).to.equal("");
		});

		it('emit calls the socket emit function', function() {
			var data = {
				a: 1,
				b: 2
			};

			user.emit("TEST", data);

			expect(socketSpy.called).to.be(true);
			expect(socketSpy.calledWith("TEST", data)).to.be(true);
		});

		it('send User details calls the socket emit function with correct user data', function() {

			var data = {
				user: user.getUserDetails()
			};

			user.sendUserDetails();

			expect(socketSpy.called).to.be(true);
			expect(socketSpy.calledWith("USER details", data)).to.be(true);
		});

	});


	describe('Setting user details', function() {
		it('can set the user name and retrieve it', function() {
			user.name = "John";

			var userDetails = user.getUserDetails();

			expect(userDetails.name).to.equal("John");
		});

		it('can set roomId and retrieve it', function() {
			user.roomId = "XXXX";

			var userDetails = user.getUserDetails();

			expect(userDetails.roomId).to.equal("XXXX");
		});

		it('can set image and retrieve it', function() {
			var image = {
				a: 1,
				b: 2
			};
			user.image = image;

			var userDetails = user.getUserDetails();

			expect(userDetails.image).to.equal(image);
		});
	});
});
