ClonageApp.controller("roomController", function($scope, $window, userService, roomService, RoutingService, gameService) {

    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getActiveUsersInRoom = roomService.getActiveUsersInRoom;
    $scope.getObserversInRoom = roomService.getObserversInRoom;
    $scope.getGameParameters = roomService.getGameParameters;
    $scope.getBotsInRoom = roomService.getBotsInRoom;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";

    $scope.sendMessage = function(messageText) {
        userService.sendMessage(messageText);
        $scope.messageText = '';
    };

    $scope.getMessages = roomService.getMessages;

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
        $scope.multipleCanvasEnabled = true;
    };

    $scope.joinRoom = function(roomId) {
        console.log(roomId);
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
        roomService.setBotNumber(number);
    };

    $scope.setRoundNumber = function(number) {
        roomService.setRoundNumber(number);
    };

    $scope.$watch(function() {
        return $window.innerWidth;
    }, function(value) {
        if (value < 768) {
            $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";
        } else {
            $scope.userPanelTemplate = "includes/templates/user/userPanelLarge.html";
        }
    });
});
