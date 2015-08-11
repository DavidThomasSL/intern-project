ClonageApp.controller("MainController", function($scope, $interval, userService, roomService, gameService,errorService,  toastr) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;


    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function(botsEnabled) {
        gameService.sendReadyStatus($scope.roomId(), botsEnabled);
    };

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    };

    function displayErrorMessage(errorMessage) {
        toastr.error(errorMessage);
    }

    errorService.registerErrorListener(displayErrorMessage);

    /*
    -------------------------------------------------------
    TIMER FUNCTIONS AND VARIABLES
    -------------------------------------------------------
    */
    var countdown;

    /*
        when moving to the waiting page
        function is called to save the value of the countdown
    */
    $scope.retainCountdownValue = function() {
        gameService.setCountdown($scope.counter);
    };

    // start countdown
    $scope.startCountdown = function() {

        //don't start a new countdown if one is already running ->>> it cancells the current one and start a new one
        if ( angular.isDefined(countdown) ) $scope.stopCountdown();

        /*
            if we don't get the value of the countdown from the server
            reset countdown to 30 seconds
            (=> page is loaded for the first time not refreshed)
        */
        if (gameService.getCountdown() === undefined) {
            $scope.counter = 30;
        }

        countdown = $interval( function() {

            /*
                on refresh we get the value from the server
                so we set the counter to that value
                and reset it to undefined
            */
            if (gameService.getCountdown() !== undefined) {
                $scope.counter = gameService.getCountdown();
                gameService.setCountdown(undefined);
            }

            // if time hasn't run out -> decrement counter
            if ($scope.counter > 0) {

                $scope.counter -- ;

            } else {

                $scope.stopCountdown(); // otherwise -> stop the counter

            }

        }, 1000); // call this function every 1 second
    };

    // stop the countdown by cancelling the interval and setting it to undefined
    $scope.stopCountdown = function() {

        if (angular.isDefined(countdown)) {
            $interval.cancel(countdown);
            countdown = undefined;
        }
    };

    /*
    ---------------------------------------------------------
    */


});
