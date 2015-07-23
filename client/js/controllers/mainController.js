ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.$storage = $sessionStorage;
    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.roomId = roomService.getRoomId;
    $scope.roundQuestion = gameService.getRoundQuestion;
    $scope.userHand = userService.getUserHand;
    $scope.gameInProgress = roomService.getGameInProgress;
    $scope.roomErrorMessage = roomService.getErrorMessage;

    //get all answers submitted in order to visualise them on the voting page
    $scope.answers = gameService.getAnswers;

    //get results after each round which involves: what each player submitted, who voted for their answer, and their score after the round
    //in order to calculate the points after the round multiply 50 with the number of votes
    $scope.results = gameService.getResults;

    //get final scores for all players when the game finishes
    $scope.finalresults = gameService.getFinalResults;

    //call function to finish the game in a certain room if players wanted to finish game
    $scope.finishGame = function() {
        gameService.finishGame($scope.roomId());
    };

    //call function to get next round
    $scope.nextRound = function() {
        gameService.nextRound($scope.roomId());
    };

    //function call to submit an answer to the question
    $scope.submitAnswer = function(enteredAnswer) {
        userService.submitAnswer(enteredAnswer);
    };

    //function call to submit a vote for the funniest answer
    $scope.submitVote = function(enteredAnswer) {
        userService.submitVote(enteredAnswer);
    };

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
    };

    $scope.submitName = function(form) {
        //todo validate input field
        userService.setName(form.enteredName);
    };

    $scope.joinRoom = function(form) {
        roomService.joinRoom(form.enteredRoomId);
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };

    $scope.startGame = function() {
        gameService.startGame($scope.roomId());
    };

});
