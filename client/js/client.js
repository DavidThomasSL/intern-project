var ClonageApp = angular.module("ClonageApp", ['ngStorage']);

ClonageApp.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});

ClonageApp.controller("MainController", function($scope, socket, $localStorage, $sessionStorage) {
	var user = {};

	$scope.enteredName = "";
	$scope.registered = false;
	$scope.nameSet = false;
	$scope.roomJoined = false;
	$scope.gameStage = 0;
	$scope.usersInRoom = [];

	$scope.$storage = $localStorage;

	socket.on('connect', function() {
		//tell the server to register us as a new player or get our old profile
		socket.emit('join', {
			token: $scope.$storage.userId
		});

		//Server sending usre details (either new or previosuly existing)
		socket.on('user details', function(msg) {

			user.uId = msg.user.uId;
			print(msg.user);

			//check if user has a name at this stage
			if (msg.user.name !== undefined) {
				$scope.nameSet = true;
				$scope.enteredName = msg.user.name;
			}

			//Set the browser cookies to user details
			// setCookie('token', msg.user.uId);
			// setCookie('name', msg.user.name);
			$scope.$storage.userId = msg.user.uId;
			$scope.$storage.username = msg.user.name;
			$scope.$storage.roomId = undefined;

			$scope.registered = true;

			//check if the user is in a room already
			// if so, put him back into the room,
			// then move straight into the next stage of the game
			if (msg.user.roomId !== undefined) {
				joinServerRoom(msg.user.roomId, roomJoinResult);
			}
		});

	});

	/*
		This function is passed as a callback when a user either joins or creates a room
		It takes as an argument the details of the room the user joined,
		and sets up local storage so that the user can join the room again if they reconnect
	*/
	function roomJoinResult(args) {
		// alert("room join result " + msg.success);
		if (args.success) {
			$scope.roomJoined = true;
			$scope.gameStage = 1;
			$scope.usersInRoom = getUsersFromIds(args.usersInRoom);
			console.log($scope.usersInRoom);
			$scope.$storage.roomId = args.roomId;

		} else {
			print("could not join");
		}
	}


	$scope.submitName = function() {
		socket.emit('set name', {
			uId: user.uId,
			name: $scope.enteredName
		});
		$scope.nameSet = true;
		print("sent name " + $scope.enteredName);
	}

	$scope.createRoom = function() {
		socket.emit('create room', {
			playerId: user.uId
		}, function(args) {
			roomJoinResult(args);
		});
		print("created room");
	}

	$scope.joinRoom = function() {
		print("joining room");
		joinServerRoom($scope.enteredRoomId, roomJoinResult);
	}

	$scope.isGameStage = function(stage_check) {
		return stage_check === $scope.gameStage;
	}

	//Returns a list of all the users in a given room
	$scope.getUsersInRoom = function() {

		return $scope.usersInRoom;
	}

	//PRIVATE HELPER METHODS
	//------------------------------

	//Calls the server to let the player join a room, given a room id
	function joinServerRoom(roomId, callback) {
		socket.emit('join room', {
			playerId: user.uId,
			roomId: roomId
		}, function(args) {
			callback(args)
		});
		print("entered room " + roomId);
	}

	//Given a user id, asks the server for the name of the user with that id
	function getUsersFromIds(ids) {
		var usernames = [];
		ids.forEach(function(id) {
			socket.emit('get username', {
				uId: id
			}, function(name) {
				usernames.push(name);
				console.log("got a name");
			});
		});

		console.log("here are the users in the game" + usernames);
		console.log(usernames)
		return usernames;
	}

	function print(msg) {
		console.log(msg);
	}



});


//Controllers
//-------------->


// var messageList = document.getElementById('messages');
// var textBox = document.getElementById('message-box');

// // var socket = io.connect();
// // var user = {};

// socket.on('connect', function() {

// 	//tell the server to register us as a new player or get our old profile
// 	socket.emit('join', {
// 		token: getCookie("token")
// 	});

// 	socket.on('user details', function(msg) {
// 		print("Setting cookie for new user" + msg.user.uId);
// 		user.uId = msg.user.uId;
// 		print(msg.user);
// 		setCookie('token', msg.user.uId);
// 		setCookie('name', msg.user.name);

// 	});

// 	socket.on('room created', function(msg) {
// 		print(msg.roomId);
// 	});

// 	socket.on('room joined', function(msg) {
// 		alert("successfully joined room " + msg.roomId);
// 	});

// 	socket.on('failed room join', function(msg) {
// 		alert("failed to join room ");
// 	});
// });

// function submitName() {
// 	var name = document.getElementById('name-input-box').value;
// 	document.getElementById('name-input-box').value = "";

// 	socket.emit('set name', {
// 		uId: user.uId,
// 		name: name
// 	});

// }

// function createRoom() {
// 	socket.emit('create room', {
// 		playerId: user.uId
// 	});
// 	print("created room");
// }

// function joinRoom() {
// 	var enteredRoomId = document.getElementById('room-input-box').value;
// 	document.getElementById('room-input-box').value = "";
// 	socket.emit('join room', {
// 		playerId: user.uId,
// 		roomId: enteredRoomId
// 	});

// }