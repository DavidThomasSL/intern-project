ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;

    //current results will hold all players scores at the current time in the game
    $scope.currentscores = function() {
        scores = gameService.getCurrentScores();
        userService.setRank(scores);
        return scores;
    };

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function() {
    	gameService.sendReadyStatus($scope.roomId());
    }

    //get user rank
    $scope.rank = userService.getRank;

});
