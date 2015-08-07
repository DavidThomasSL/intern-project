ClonageApp.controller("MainController", function($scope, userService, roomService, gameService,errorService,  toastr) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function(botsEnabled) {
        gameService.sendReadyStatus($scope.roomId(), botsEnabled);
    };

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    };

    function displayErrorMessage(errorMessage) {
        toastr.error(errorMessage);
    }

    errorService.registerErrorListener(displayErrorMessage);

});
