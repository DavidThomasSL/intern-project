ClonageApp.controller("roomController", function($scope, userService, roomService, RoutingService, gameService) {

    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.botsStatus = roomService.botsStatus;


    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
    };

    $scope.joinRoom = function(roomId) {
        roomService.joinRoom(roomId);
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

    // Called when the bot status is changes on the server
    function updateBotStatus(status) {
        $scope.botsStatus = status;
    }

    roomService.registerListener(updateBotStatus);



});
