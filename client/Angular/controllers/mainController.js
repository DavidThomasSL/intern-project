ClonageApp.controller("MainController", function($scope, $interval, userService, roomService, gameService,errorService,  toastr) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
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

    function displayErrorMessage(errorMessage) {
        toastr.error(errorMessage);
    }


    //timer stuff
    var countdown;


    $scope.startCountdown = function() {

        //don't start a new countdown if one is already running ->>> maybe make it so it cancells the current one and start a new one?
        if ( angular.isDefined(countdown) ) $scope.stopCountdown();

        var timerCount = 30;

        countdown = $interval( function() {

            if (timerCount > 0) {
                $scope.counter = timerCount ;
                timerCount -- ;
            }
            else {
                $scope.stopCountdown();
            }

        }, 1000);
    };

     $scope.stopCountdown = function() {

        if (angular.isDefined(countdown)) {
            $interval.cancel(countdown);
            countdown = undefined;
        }
    };

    errorService.registerErrorListener(displayErrorMessage)

});
