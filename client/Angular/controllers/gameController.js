ClonageApp.controller("gameController", function($scope, $timeout, $window, $sce, userService, roomService, RoutingService, gameService, toastr, $location, $sessionStorage, $anchorScroll, playerService) {

    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.answerPosition = playerService.getAnswerPosition;
    $scope.currentQuestion = gameService.getCurrentQuestion;

    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getActiveUsersInRoom = roomService.getActiveUsersInRoom;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.getBotsInRoom = roomService.getBotsInRoom;

    $scope.cardReplaceCost = playerService.getCurrentReplaceCost;
    $scope.getObserversInRoom = roomService.getObserversInRoom;
    $scope.handReplaceCost = gameService.getHandReplaceCost;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";

    $scope.currentNumberOfSubmissions = gameService.getCurrentNumberOfSubmissions;
    $scope.currentNumberOfVotes = gameService.getCurrentNumberOfVotes;
    $scope.roundSubmissionData = gameService.getRoundSubmissionData;

    $scope.index = 0;
    $scope.timeToWaitAnimation = gameService.getTimeout();

    var timer;

    //TODO Fix off by one error with index

    //get all answers submitted in order to visualise them on the voting page
    $scope.visualiseAnswers = function() {
        var ans = gameService.getAnswersToVisualise().filter(function(submission) {
            return submission.submissionsText.length > 0;
        });

        ans.sort(function(a, b) {
            if (a.submissionsText[0] < b.submissionsText[0])
                return -1;
            if (a.submissionsText[0] > b.submissionsText[0])
                return 1;
            return 0;
        })

        var filtered = [];

        if ($scope.index < gameService.getCurrentNumberOfSubmissions()) {
            filtered.push(ans[$scope.index]);
        } else {
            $scope.index = gameService.getCurrentNumberOfSubmissions();
            filtered = ans;
            $scope.stopTimer();
        }

        return filtered;
    };


    $scope.startTimer = function() {
        if (angular.isDefined(timer)) $timeout.cancel(timer);

        timer = $timeout(function() {
            $scope.index++;
        }, $scope.timeToWaitAnimation);
    };

    $scope.stopTimer = function() {
        if (angular.isDefined(timer)) $timeout.cancel(timer);
    };

    //dynamicFilledInQuestion is the string displayed on the question page that updates as the player clicks answers
    $scope.dynamicFilledInQuestion = playerService.getCurrentFilledInQuestion;


    //filledInQuestion is the submission displayed on the question waiting page.
    //It is fetched from from the answers array so it can be seen after refreshing.
    $scope.filledInQuestion = function() {
        var text = "";
        $scope.roundSubmissionData().forEach(function(submission) {
            if (submission.player.uId === userService.getUserId()) {
                text = submission.filledInText;
            }
        });
        return text;
    };

    // Use the sce service to allow us to inject html in a string straight to a page and render it
    $scope.bindHtml = function(text) {
        return $sce.trustAsHtml(text);
    };

    //call function to get next round
    $scope.nextRound = function() {
        gameService.nextRound($scope.roomId());
    };

    //function call to submit an answer to the question
    $scope.submitAnswer = function(enteredAnswer) {
        playerService.submitChoice(enteredAnswer);
    };

    //function call to submit a vote for the funniest answer
    $scope.submitVote = function(enteredAnswer) {
        playerService.submitVote(enteredAnswer);
    };

    $scope.replaceHand = function(userHand) {
        playerService.replaceHand(userHand);
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
        gameService.clearGameData();
    };

    // Called when a user presses play again on endGame.html
    $scope.playAgain = function() {
        var oldRoomId = userService.getRoomId();

        // create a new room a put the user in it
        roomService.createRoom(userService.getUserId());

        //as with leaveRoom, remove all ranking and scores data once the player leaves the room
        gameService.clearGameData();

        // send a message to all other players in the room asking if they want to join the new room
        playerService.playAgain(userService.getUserId(), oldRoomId);
    };

    // Used to change the use rpanel template based on screen width
    $scope.$watch(function() {
        return $window.innerWidth;
    }, function(value) {
        if (value < 768) {
            $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";
        } else {
            $scope.userPanelTemplate = "includes/templates/user/userPanelLarge.html";
        }
    });
});