ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.$storage = $sessionStorage;
    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.roomId = roomService.getRoomId;
    $scope.roundQuestion = gameService.getRoundQuestion;
    $scope.userHand = userService.getUserHand;
    $scope.getUserId = userService.getUserId;
    $scope.gameInProgress = roomService.getGameInProgress;
    $scope.roomErrorMessage = roomService.getErrorMessage;
    $scope.answers = gameService.getAnswers;
    $scope.results = gameService.getResults;
    $scope.finalresults = gameService.getFinalResults;

    $scope.finishGame = function() {
        gameService.finishGame($scope.roomId());
    };

    $scope.nextRound = function() {
        gameService.nextRound($scope.roomId());
    };

    $scope.submitAnswer = function(enteredAnswer) {
        userService.submitChoice(enteredAnswer);
    };

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
