ClonageApp.controller("MainController", function($scope, $interval, userService, roomService, gameService, notificationService, toastr, playerService) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;
    $scope.getUserImage = userService.getUserImage;
    $scope.getIfObserver = userService.getIfObserver;
    $scope.playAgainWasPressed = userService.playAgainWasPressed;
    $scope.getUserFromId = roomService.getUserFromId;
    $scope.allRoomsAvailable = gameService.allRoomsAvailable;

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function(botsEnabled) {
        playerService.sendReadyStatus($scope.roomId());
    };

    /*
        check if a certain user had submitted an answer yet
        function called in order to visualise on the timer when a certain player has submited
    */
    $scope.hasSubmitted = gameService.hasSubmitted;
    /*
        check if a certain user had voted for an answer yet
        function called in order to visualise on the timer when a certain player has submitted
    */
    $scope.hasVoted = gameService.hasVoted;

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    };

    function displayNotificationMessage(notificationMessage, notificationType) {
        switch (notificationType) {
            case "error":
                toastr.error(notificationMessage);
                break;
            case "success":
                toastr.success(notificationMessage);
                break;
            case "info":
                toastr.info(notificationMessage);
                break;
            case "warning":
                toastr.info(notificationMessage);
                break;
            default:
                toastr.error(notificationMessage);
        }
    }

    // TODO make toaster server for this
    var notificationCalled = function(data) {
        if (data.action === "play again") {

            toastr.success('<div id="toaster">' + data.user + ' wants to play again.<br> Click here to join</div>', {
                allowHtml: true,
                showCloseButton: true,
                timeOut: 10000,
                extendedTimeOut: 10000,
                onHidden: function(clicked) {
                    if (clicked) {
                        roomService.leaveRoom();
                        rank = "";
                        roomService.joinRoom(data.newRoomId);
                    }
                }
            });
        }
    };

    notificationService.registerMessageListener(displayNotificationMessage);
    notificationService.registerActionListener(notificationCalled);

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
        if ($scope.counter !== 60) {
            gameService.setCountdown($scope.counter);
        }
    };

    // start countdown
    $scope.startCountdown = function() {

        //don't start a new countdown if one is already running ->>> it cancells the current one and start a new one
        if (angular.isDefined(countdown)) $scope.stopCountdown();

        /*
            if we don't get the value of the countdown from the server
            reset countdown to 30 seconds
            (=> page is loaded for the first time not refreshed)
        */
        if (gameService.getCountdown() === undefined) {
            $scope.counter = 60;
        }

        countdown = $interval(function() {

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

                $scope.counter--;

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
