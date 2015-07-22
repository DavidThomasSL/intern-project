ClonageApp.controller("MainController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.$storage = $sessionStorage;
    $scope.getUserName = userService.getUserName;
    $scope.getUsersInRoom = roomService.getUsersInRoom;
    $scope.roomId = roomService.getRoomId;
    $scope.roundQuestion = gameService.getRoundQuestion;
    $scope.userHand = userService.getUserHand;

    $scope.submitAnswer = function(enteredAnswer) {
        userService.submitAnswer(enteredAnswer);
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
