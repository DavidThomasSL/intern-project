ClonageApp.controller("MainController", function($scope, $interval, $window, userService, roomService, gameService, notificationService, toastr, playerService) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getUserImage = userService.getUserImage;
    $scope.getIfObserver = userService.getIfObserver;
    $scope.playAgainWasPressed = userService.playAgainWasPressed;
    $scope.getUserFromId = roomService.getUserFromId;
    $scope.allRoomsAvailable = gameService.allRoomsAvailable;
    $scope.roundSubmissionData = gameService.getRoundSubmissionData;

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

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function(botsEnabled) {
        playerService.sendReadyStatus($scope.roomId());
    };

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        return gameService.getPlayerCurrentRank(playerId);
    };

    /*
    -----------------------------------------------------------------
    MESSENGER FUNCTIONS
    -----------------------------------------------------------------
    */
    $scope.loadedMessages = []; // used to autscroll to bottom when chat is open
    $scope.toggled = false; // used for messaging collapsing

    var msg;
    var oldMsgNo;

    $scope.getMessages = function() {
        msg = roomService.getMessages();
        if ($scope.toggled === false) {         // if the chat is not open
            if (msg.length !== oldMsgNo) {         // if we have unread messages
                if (oldMsgNo === undefined)  {      // if the old no of messages was not defined aka -> page reload
                    $scope.missedMsg = msg.length;
                }
                else {                                 // else we just have new messages
                    $scope.missedMsg = msg.length - oldMsgNo;
                }
            }
        }
        else $scope.loadedMessages = msg;
        return msg;
    }

    /*
        gets the screenWidth and stores it in scope
        function used to set the chat to collapse on new page
        only for mobiles and keep it's state for desktops
    */
    $scope.$watch(
        function() {
            return $window.innerWidth;
        }, function(value) {
            $scope.screenWidth = value;
   });

    // reset toggle is called only on mobile to collapse the chat on new page
    $scope.resetToggle = function() {
        $scope.toggled = false;
        $scope.loadedMessages = [];
    };

    // send message and reset the input box
    $scope.sendMessage = function(messageText) {
        userService.sendMessage(messageText);
        $scope.messageText = '';
    };

    /*
        on toggle up the messages are loaded
        on toggle down the messages reset
        toggled changes value
    */
    $scope.toggle = function() {
        if ($scope.toggled === true) {
            $scope.loadedMessages = [];
        }
        else $scope.loadedMessages =  $scope.getMessages;
        $scope.toggled = !$scope.toggled;
        $scope.missedMsg = 0 ;
        oldMsgNo = msg.length;
    };


    /*
    --------------------------------------------------------------------
    NOTIFICATIONS FUNCTIONS
    --------------------------------------------------------------------
    */

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
