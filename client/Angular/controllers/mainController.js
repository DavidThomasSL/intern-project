ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUserName = userService.getUserName;

    //current results will hold all players scores at the current time in the game
    $scope.currentscores = function() {
        scores = gameService.getCurrentScores();
        userService.setRank(scores);
        return scores;
    };

    //get user rank
    $scope.rank = userService.getRank;

});
