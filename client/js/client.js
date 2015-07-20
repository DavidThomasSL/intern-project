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
      })
      .when('/room/', {
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
				$location.path('/joining');
			}

			//Storing user details in browser local storage
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

		//when a new user joins the room
		socket.on('new join', function(msg) {


			console.log("new user:" + msg);
			var newuser = getUserFromId(msg);

			console.log("new username:" + newuser);

			// var alreadyin = false;
			// $scope.usersInRoom.forEach(function(user) {
			// 	if (newuser === user) {
			// 		alreadyin = true;
			// 	}
			// });
			// if (alreadyin === false ) {
			// 	//$scope.usersInRoom.push(newuser);
			// }
		});

	});

	$scope.submitName = function(form) {

		var enteredName = form.enteredName;
		$scope.enteredName = enteredName;

		socket.emit('set name', {
			uId: user.uId,
			name: enteredName
		}, function() {
			$location.path('/joining');
		});
		$scope.nameSet = true;
	};


	$scope.createRoom = function() {
		socket.emit('create room', {
			playerId: user.uId
		}, function(args) {
			roomJoinResult(args);
		});
		print("created room");
	};


	$scope.joinRoom = function(form) {
		print("joining room");
		joinServerRoom(form.enteredRoomId, roomJoinResult);
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
			$location.path('/room/');

		} else {
			alert("Could not join");
		}
	}

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

	function getUserFromId(id) {
		var username;
		socket.emit('get username', {
				uId: id
			}, function(name) {

				var alreadyin = false;
				$scope.usersInRoom.forEach(function(user) {
					if (name === user) {
						alreadyin = true;
				 	}
				 });
				if (alreadyin === false ) {
					$scope.usersInRoom.push(name);
				}

				console.log("got a name: " + name);
				return name;
			});

		console.log("got a username: " + name);

	}

	function print(msg) {
		console.log(msg);
	}



});