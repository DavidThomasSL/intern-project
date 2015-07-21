var ClonageApp = angular.module("ClonageApp", ['ngStorage', 'ngRoute', 'btford.socket-io']);

ClonageApp.factory('socket', function(socketFactory) {
    return socketFactory();
});

ClonageApp.config(['$routeProvider', '$locationProvider',
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
                templateUrl: '/templates/setname.html'
            });

    }
]);

ClonageApp.service('RoutingService', ['socket', '$location', function(socket, $location) {

    socket.on("ROUTING", function(msg) {
        console.log("sending user to room");

        if (msg.location === 'room') {
            $location.path('/room');
        } else if (msg.location === 'joining') {
            $location.path('/joining');
        }
    });

    return null;
}]);

ClonageApp.service('roomService', ['socket', '$localStorage', function(socket, $localStorage) {

    var roomId = -1;
    var usersInRoom = [];

    function createRoom(playerId) {
        socket.emit("ROOM create", {
            playerId: playerId
        });

    }

    function joinRoom(roomId) {
        socket.emit('ROOM join', {
            roomId: roomId
        });
    }

    function getUsersInRoom() {
        console.log(usersInRoom);
        return usersInRoom;
    }

    socket.on("ROOM details", function(data) {
        roomId = data.roomId;
        usersInRoom = data.usersInRoom;
        console.log("users in room, below");
        console.log(usersInRoom);
    });

    return {
        createRoom: createRoom,
        joinRoom: joinRoom,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom
    }

}]);


ClonageApp.service('userService', ['socket', '$localStorage', function(socket, $localStorage) {

    var user = {};

    /*
        When the client connects, we need to register him with the server properly
        IF the user has exisiting details, we send that, and set up his user details
    */
    socket.on('connect', function(msg) {
        console.log("connected");
        registerUser();
    });

    socket.on('USER details', function(msg) {
        user = msg.user;
        $localStorage.userId = user.uId;
        $localStorage.roomId = user.roomId;
        console.log("Got user details from server " + user.uId);
        console.log(user);
    });

    socket.on("USER room join", function(data) {
        $localStorage.roomId = data.roomId;
        userInRoom = true;
    });

    function registerUser() {
        socket.emit('USER register', {
            token: $localStorage.userId
        });
    }

    function setName(name) {
        socket.emit('USER set name', {
            name: name
        });
    }

    function getUserName() {
        return user.name;
    }

    function getUserId() {
        return user.id;
    }

    return {
        hello: function() {
            console.log("hello");
        },
        setName: setName,
        getUserName: getUserName,
        getUserId: getUserId
    };
}]);


ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, $location, $localStorage) {

    $scope.$storage = $localStorage;
    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom;

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
    };

    $scope.submitName = function(form) {
        //todo validate input field
        userService.setName(form.enteredName);
    };

    $scope.joinRoom = function(form) {
        roomService.joinRoom(form.enteredRoomId);
    };


    // $scope.createRoom = function() {
    //  socket.emit('create room', {
    //      playerId: user.uId
    //  }, function(args) {
    //      roomJoinResult(args);
    //  });
    //  print("created room");
    // };


    // $scope.joinRoom = function(form) {
    //  print("joining room");
    //  joinServerRoom(form.enteredRoomId, roomJoinResult);
    // };


    //  This function is passed as a callback when a user either joins or creates a room
    //  It takes as an argument the details of the room the user joined,
    //  and sets up local storage so that the user can join the room again if they reconnect

    // function roomJoinResult(args) {
    //  // alert("room join result " + msg.success);
    //  if (args.success) {
    //      $scope.roomJoined = true;
    //      $scope.gameStage = 1;
    //      $scope.usersInRoom = getUsersFromIds(args.usersInRoom);
    //      console.log($scope.usersInRoom);
    //      $scope.$storage.roomId = args.roomId;
    //      $location.path('/room/');

    //  } else {
    //      alert("Could not join");
    //  }
    // }

    // $scope.isGameStage = function(stage_check) {

    //  return stage_check === $scope.gameStage;
    // };

    // //Returns a list of all the users in a given room
    // $scope.getUsersInRoom = function() {

    //  return $scope.usersInRoom;
    // };

    // /*
    //  Removes the user from the room he is on, and on the server
    //  Takes them back to the room join/create page
    //  Removed room id from the session storage
    // */
    // $scope.leaveRoom = function() {

    //  var roomId = $scope.$storage.roomId;
    //  var userId = $scope.$storage.userId;

    //  console.log("removing player....");

    //  socket.emit('leave room', {
    //      roomId: roomId,
    //      userId: userId
    //  }, function(msg) {
    //      if (msg) {
    //          console.log("user left room: " + roomId);
    //          $scope.$storage.roomId = -1;
    //          $scope.gameStage = 0;
    //          $location.path('/joining');
    //      } else {
    //          console.log("there was an error");
    //      }
    //  });

    // };

    // //PRIVATE HELPER METHODS
    // //------------------------------

    // //Calls the server to let the player join a room, given a room id
    // function joinServerRoom(roomId, callback) {
    //  socket.emit('join room', {
    //      playerId: user.uId,
    //      roomId: roomId
    //  }, function(args) {
    //      callback(args);
    //  });
    //  print("entered room " + roomId);
    // }

    // //Given a user id, asks the server for the name of the user with that id
    // function getUsersFromIds(ids) {
    //  var usernames = [];
    //  ids.forEach(function(id) {

    //      if (id === $scope.$storage.userId) {
    //          usernames.push("Me!");
    //      } else {
    //          socket.emit('get username', {
    //              uId: id
    //          }, function(name) {
    //              usernames.push(name);
    //              console.log("got a name");
    //          });
    //      }

    //  });

    //  console.log("here are the users in the game" + usernames);
    //  return usernames;
    // }

    // function print(msg) {
    //  console.log(msg);
    // }
});