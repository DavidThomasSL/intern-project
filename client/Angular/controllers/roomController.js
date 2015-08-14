ClonageApp.controller("roomController", function($scope, userService, roomService, RoutingService, gameService) {

    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.getGameParameters = roomService.getGameParameters;

    var botNumber = 0;
    var numRounds = 0;

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
        $scope.multipleCanvasEnabled = true;
    };

    $scope.joinRoom = function(roomId) {
        roomService.joinRoom(roomId);
        $scope.multipleCanvasEnabled = true;
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };

    $scope.toggleBots = function() {
        roomService.toggleBotStatus();
    };

    $scope.getUserId = function() {
        return userService.getUserId();
    };

    $scope.getRoomUserCount = function() {
        var num = roomService.getUsersInRoom();
        return num.length;
    };

    $scope.setBotNumber = function(number) {
        botNumber = number;
        roomService.setGameParameters(numRounds, botNumber);
    };

    $scope.setRoundNumber = function(number) {
        numRounds = number;
        roomService.setGameParameters(numRounds, botNumber);
    };

});
