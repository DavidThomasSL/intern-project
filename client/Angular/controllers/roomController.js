ClonageApp.controller("roomController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.drawingEnabled = false; // Set whether the canvas can be drawn or not



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

    // Scope given to the userCanvasDirective, which attaches a getCanvasData function to it
    // This can be used to get the canvas data
    $scope.roomCanvasControl = {
        canCanvasDraw: function() {
            return $scope.drawingEnabled;
        },
        getId: function() {
            return 1;
        }
    };

    // Gets the user image from the userService
    // When it gets the images, places it onto the canvas
    $scope.$watch(function() {
        return userService.getUserImage();
    }, function(newVal, oldVal) {

        $scope.userImage = userService.getUserImage();

        $scope.roomCanvasControl.drawCanvasImage($scope.userImage);

        $scope.roomCanvasControl.scaleCanvas(0.5,0.5);

    }, true);

    $scope.setCanvas();

});
