ClonageApp.controller("MainController", function($scope, $interval, userService, roomService, gameService, notificationService, toastr, playerService) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getUserImage = userService.getUserImage;
    $scope.getIfObserver = userService.getIfObserver;
    $scope.playAgainWasPressed = userService.playAgainWasPressed;
    $scope.getUserFromId = roomService.getUserFromId;
    $scope.allRoomsAvailable = gameService.allRoomsAvailable;

    $scope.getMessages = function() {
        msg = roomService.getMessages();
        if ($scope.toggled === false) {
            if (msg.length !== oldMsgNo) {
                if (oldMsgNo === undefined)  {
                    $scope.missedMsg = msg.length;
                }
                else {
                    $scope.missedMsg = msg.length - oldMsgNo;
                }
            }
        }
        return msg;
    }

    $scope.toggled = false; //used for messaging collapsing

    var msg;
    var oldMsgNo;
    $scope.missedMsg;

    $scope.resetToggle = function() {
        $scope.toggled = false;
    };

     $scope.sendMessage = function(messageText) {
        userService.sendMessage(messageText);
        $scope.messageText = '';
    };

    $scope.toggle = function() {
        $scope.toggled = !$scope.toggled;
        $scope.missedMsg = 0 ;
        oldMsgNo = msg.length;
    };

    $scope.roundSubmissionData = gameService.getRoundSubmissionData;


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

            // make toast that lets the player join another room
            toastr.success('<div id="toaster">' + data.user + ' wants to play again.<br> Click here to join</div>', {
                allowHtml: true,
                showCloseButton: true,
                timeOut: null,
                extendedTimeOut: 10000,
                onHidden: function(clicked) {
                    if (clicked) {
                        roomService.leaveRoom();
                        rank = "";
                        roomService.joinRoom(data.newRoomId);
                    }
                }
            });
        } else if (data.action === "join room observer") {
            //make toast that lets the user join a game as an observer
            toastr.warning('<div id="toaster">Game already in progress<br> Click here to watch as an Observer</div>', {
                allowHtml: true,
                showCloseButton: true,
                timeOut: 10000,
                extendedTimeOut: 10000,
                onHidden: function(clicked) {
                    if (clicked) {
                        roomService.joinRoomForce(data.roomId);
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

    // start countdown
    $scope.startCountdown = function(text) {

        console.log("calling start countdown");

        //don't start a new countdown if one is already running ->>> it cancells the current one and start a new one
        if (angular.isDefined(countdown)) {

            $interval.cancel(countdown);
            countdown = undefined;
            if (text === undefined) $scope.counter = 60;
            else $scope.counter = 20;
            $scope.newCountdown();
        }
        else  {

            if (text === undefined) $scope.counter = 60;
            else $scope.counter = 20;
            $scope.newCountdown();
        }

    };

    $scope.newCountdown = function() {

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
