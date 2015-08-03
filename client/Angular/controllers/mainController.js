ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.currentResults = gameService.getPlayerRoundResults;

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function() {
        gameService.sendReadyStatus($scope.roomId());
    }

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        console.log(gameService.getPlayerCurrentRank(playerId));
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    }


});