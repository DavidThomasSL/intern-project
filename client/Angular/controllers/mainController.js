ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage, $timeout) {

    $scope.gameInProgress = roomService.getGameInProgress;
    $scope.counter = 30;

    //current results will hold all players scores at the current time in the game
    $scope.currentscores = function() {
        scores = gameService.getCurrentScores();
        userService.setRank(scores);
        return scores;
    };

    //get user rank
    $scope.rank = userService.getRank;


    var startCountdown = function() {

        var timerCount = 30;

        var countDown = function() {
            if (timerCount < 0) {
                console.log('Time is up!');
            } else {

                $scope.counter = timerCount ;
                timerCount-= 1 ;
                $timeout(countDown, 1000);

            }
        };
        countDown();
    };

    startCountdown();

});
