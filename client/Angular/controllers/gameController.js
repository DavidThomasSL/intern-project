ClonageApp.controller("gameController", function($scope, $window, userService, roomService, RoutingService, gameService, $location, $sessionStorage, $anchorScroll) {

    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.answerPosition = gameService.getAnswerPosition;
    $scope.currentQuestion = gameService.getCurrentQuestion;

    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.cardReplaceCost = gameService.getCurrentReplaceCost;
    $scope.replaceCostPerCard = gameService.getReplaceCostPerCard;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";


    //get all answers submitted in order to visualise them on the voting page
    $scope.answers = gameService.getAnswers;

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

    $scope.replaceCardsSelect = function(selectedCardText) {
        gameService.replaceCardsSelect(selectedCardText);
    };

    $scope.replaceCardsSubmit = function() {
        gameService.replaceCardsSubmit();
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
        gameService.clearGameData();
    };

    $scope.$watch(function() {
        return $window.innerWidth;
    }, function(value) {
        if (value < 768) {
            $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";
        } else {
            $scope.userPanelTemplate = "includes/templates/user/userPanelLarge.html";
        }
        console.log(value);
    });
});
