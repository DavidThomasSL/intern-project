ClonageApp.controller("roomController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;


    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
    };

    $scope.joinRoom = function(roomId) {
        roomService.joinRoom(roomId);
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };


    $scope.getUserId = function() {
        return userService.getUserId();
    };

    $scope.getRoomUserCount = function() {
        var num = roomService.getUsersInRoom();
        return num.length;
    };


    $scope.startGame = function() {
        gameService.startGame($scope.roomId());
    };

    $scope.setCanvas = function() {
        $scope.userImage = userService.getUserImage();

        $scope.canvas = $scope.canvas = new fabric.Canvas('user-canvas-room');

        $scope.canvas.loadFromJSON($scope.userImage);
    };

    $scope.$watch(function() {
        return userService.getUserImage();
    }, function(newVal, oldVal) {
        console.log(oldVal);
        console.log(newVal);
        $scope.userImage = userService.getUserImage();
        $scope.canvas.loadFromDatalessJSON($scope.userImage, function() {
            console.log("was chnaged");
            $scope.canvas.renderAll();
        });

    }, true);

    $scope.setCanvas();

});
