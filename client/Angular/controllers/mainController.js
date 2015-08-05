ClonageApp.controller("MainController", function($scope, $timeout, userService, roomService, gameService,errorService,  toastr) {

    $scope.getUserName = userService.getUserName;
    $scope.roomId = roomService.getRoomId;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;

    //when player says they are ready to move on it sends this to the server
    $scope.sendReadyStatus = function() {
        gameService.sendReadyStatus($scope.roomId());
    }

    //get user rank
    $scope.rank = function() {
        var playerId = userService.getUserId();
        var rank = gameService.getPlayerCurrentRank(playerId);
        return rank;
    }

    function displayErrorMessage(errorMessage) {
        console.log("IM HEAR")
        toastr.error(errorMessage);
    }

    $scope.startCountdown = function() {

        var timerCount = 30;

        var countDown = function() {
            if (timerCount === 0) {


            } else {

                $scope.counter = timerCount ;
                timerCount-= 1 ;
                $timeout(countDown, 1000);

            }
        };
        countDown();
    };

    errorService.registerErrorListener(displayErrorMessage)

});
