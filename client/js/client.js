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

    function leaveRoom() {
        socket.emit('ROOM leave', {
            roomId: roomId
        });
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
        getUsersInRoom: getUsersInRoom,
        leaveRoom: leaveRoom
    };

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

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };

});