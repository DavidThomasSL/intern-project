ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function() {
        gameService.sendReadyStatus($scope.roomId());
    }

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    }

});