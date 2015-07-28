ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.$storage = $sessionStorage;
    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.roomId = roomService.getRoomId;
    $scope.roundQuestion = gameService.getRoundQuestion;
    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.gameInProgress = roomService.getGameInProgress;

    //get all answers submitted in order to visualise them on the voting page
    $scope.answers = gameService.getAnswers;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;

    //get results after each round which involves: what each player submitted, who voted for their answer, and their score after the round
    //in order to calculate the points after the round multiply 50 with the number of votes
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;
    $scope.currentVotes = gameService.getCurrentVotes;

    //get final scores for all players when the game finishes
    $scope.finalresults = gameService.getCurrentScores;
    //current results will hold all players scores at the current time in the game
    $scope.currentscores = gameService.getCurrentScores;

    //current rank for each user
    $scope.rank = userService.getRank;

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
        userService.submitChoice(enteredAnswer);
    };

    //function call to submit a vote for the funniest answer
    $scope.submitVote = function(enteredAnswer) {
        console.log(enteredAnswer);
        userService.submitVote(enteredAnswer);
    };

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
    };

    $scope.submitName = function(form) {
        //todo validate input field
        userService.setName(form.enteredName);
    };

    $scope.joinRoom = function(roomId) {
        roomService.joinRoom(roomId);
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };

    $scope.startGame = function() {
        gameService.startGame($scope.roomId());
    };

    $scope.getUserId = function() {
        return userService.getUserId();
    };

    $scope.getRoomUserCount = function() {
        var num = roomService.getUsersInRoom();
        return num.length;
    };

});