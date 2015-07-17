var ClonageApp = angular.module("ClonageApp", ['ngStorage', 'ngRoute']);

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
			});
		}
	};
});

ClonageApp.config (['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/templates/setname.html'
      })
      .when('/joining', {
        templateUrl: '/templates/joining.html'
        // controller: 'MainController'
      })
      .when('/room/:roomId', {
      	templateUrl: '/templates/room.html'
      })
      .otherwise({
      	templateUrl : '/templates/setname.html'
      });

}]);

ClonageApp.controller("MainController", function($scope, socket, $localStorage, $sessionStorage, $location) {
	var user = {};

	$scope.enteredName = "";
	$scope.registered = false;
	$scope.nameSet = false;
	$scope.roomJoined = false;
	$scope.gameStage = 0;
	$scope.usersInRoom = [];

	$scope.$storage = $localStorage;

	socket.on('connect', function() {
		print("new connection");
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

	$scope.submitName = function(form) {

		var enteredName = form.enteredName;
		$scope.enteredName = enteredName;

		print("sending name " + enteredName);
		socket.emit('set name', {
			uId: user.uId,
			name: enteredName
		});
		$scope.nameSet = true;
		print("sent name " + enteredName);
		$location.path('/joining');
	};


	$scope.createRoom = function() {
		socket.emit('create room', {
			playerId: user.uId
		}, function(args) {
			roomJoinResult(args);
		});
		print("created room");
	};


	$scope.joinRoom = function() {
		print("joining room");
		joinServerRoom($scope.enteredRoomId, roomJoinResult);
	};

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

	$scope.goback = function(number) {
		if (number == 1) {
			$scope.nameSet = true;
			$scope.gameStage = 0;
			print("going back to room");
		}
		else {
			$scope.nameSet = false;
			$scope.gameStage = 0;
			print("going back to name");
		}
	};

	$scope.isGameStage = function(stage_check) {
		return stage_check === $scope.gameStage;
	};

	//Returns a list of all the users in a given room
	$scope.getUsersInRoom = function() {

		return $scope.usersInRoom;
	};

	//PRIVATE HELPER METHODS
	//------------------------------

	//Calls the server to let the player join a room, given a room id
	function joinServerRoom(roomId, callback) {
		socket.emit('join room', {
			playerId: user.uId,
			roomId: roomId
		}, function(args) {
			callback(args);
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
		return usernames;
	}

	function print(msg) {
		console.log(msg);
	}



});