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
			//if so, we can put them straight into the next stage of the game
			if (msg.user.roomId !== undefined) {
				$scope.$storage.roomId = msg.user.roomId;
				$scope.roomJoined = true;
				$scope.gameStage = 1;
			}
		});

	});



	//Called when either the user creates a new room or joins an exisiting one
	socket.on('room join result', function(msg) {
		alert("room join result " + msg.success);
		if (msg.success) {
			$scope.roomJoined = true;
			$scope.gameStage = 1;
			$scope.$storage.roomId = msg.roomId;
			print("joined room");
		} else {
			print("could not join");
		}
	});


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
		});
		print("created room");
	}

	$scope.joinRoom = function() {
		print("joining room");
		socket.emit('join room', {
			playerId: user.uId,
			roomId: $scope.enteredRoomId
		});
		print("entered room " + $scope.enteredRoomId);
	}

	$scope.isGameStage = function(stage_check) {
		return stage_check === $scope.gameStage;
	}

	//PRIVATE HELPER METHODS
	//------------------------------


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