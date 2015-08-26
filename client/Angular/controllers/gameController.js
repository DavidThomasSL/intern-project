ClonageApp.controller("gameController", function($scope, $timeout, $window, $sce, userService, roomService, RoutingService, gameService, toastr, $location, $sessionStorage, $anchorScroll, notificationService) {

    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.answerPosition = gameService.getAnswerPosition;
    $scope.currentQuestion = gameService.getCurrentQuestion;

    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getActiveUsersInRoom = roomService.getActiveUsersInRoom;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.getBotsInRoom = roomService.getBotsInRoom;

    $scope.getObserversInRoom = roomService.getObserversInRoom;
    $scope.handReplaceCost = gameService.getHandReplaceCost;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";
    $scope.answers = gameService.getAnswers;

    $scope.index = 0;
    $scope.timeToWaitAnimation = gameService.getTimeout();

    var timer;

    //get all answers submitted in order to visualise them on the voting page
    $scope.visualiseAnswers = function() {
        var ans = gameService.getAnswers();
        var filtered = [];

        if ($scope.index < ans.length) {
            filtered.push(ans[$scope.index]);
        } else {
            $scope.index = ans.length;
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
    $scope.dynamicFilledInQuestion = gameService.getCurrentFilledInQuestion;


    //filledInQuestion is the submission displayed on the question waiting page.
    //It is fetched from from the answers array so it can be seen after refreshing.
    $scope.filledInQuestion = function() {
        var text = "";
        $scope.answers().forEach(function(answer) {
            if (answer.player.uId === userService.getUserId()) {
                text = answer.filledInText;
            }
        });
        return text;
    };

    // Use the sce service to allow us to inject html in a string straight to a page and render it
    $scope.bindHtml = function(text) {
        return $sce.trustAsHtml(text);
    };

    //get results after each round which involves: what each player submitted, who voted for their answer, and their score after the round
    //in order to calculate the points after the round multiply 50 with the number of votes
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;
    $scope.currentVotes = gameService.getCurrentVotes;

    //call function to get next round
    $scope.nextRound = function() {
        gameService.nextRound($scope.roomId());
    };

    //function call to submit an answer to the question
    $scope.submitAnswer = function(enteredAnswer) {
        gameService.submitChoice(enteredAnswer);
    };

    //function call to submit a vote for the funniest answer
    $scope.submitVote = function(enteredAnswer) {
        gameService.submitVote(enteredAnswer);
    };

    $scope.replaceHand = function(userHand) {
        gameService.replaceHand(userHand);
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

        // send a message to all other players in the room asking if they want to join the new room
        gameService.playAgain(userService.getUserId(), oldRoomId);
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
