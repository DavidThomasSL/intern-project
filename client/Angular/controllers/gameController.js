ClonageApp.controller("gameController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.roundQuestionText = gameService.getRoundQuestionText;
    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUsersInRoom = roomService.getUsersInRoom;

    //get all answers submitted in order to visualise them on the voting page
    $scope.answers = gameService.getAnswers;

    //get results after each round which involves: what each player submitted, who voted for their answer, and their score after the round
    //in order to calculate the points after the round multiply 50 with the number of votes
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;
    $scope.currentVotes = gameService.getCurrentVotes;

    //get final scores for all players when the game finishes
    $scope.finalresults = gameService.getCurrentScores;

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

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
        gameService.clearGameData();
    };

});
