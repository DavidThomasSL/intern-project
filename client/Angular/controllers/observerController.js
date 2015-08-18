ClonageApp.controller("observerController", function($scope, $rootScope, $window, userService, roomService, RoutingService, gameService, $location) {

    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getActiveUsersInRoom = roomService.getActiveUsersInRoom;
    $scope.getGameParameters = roomService.getGameParameters;
    $scope.answers = gameService.getAnswers;
    $scope.currentVotes = gameService.getCurrentVotes;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";

    $scope.getMessages = roomService.getMessages;

    $scope.createRoom = function() {
        roomService.createRoom(userService.getUserId());
        $scope.multipleCanvasEnabled = true;
    };

    $scope.joinRoom = function(roomId) {
        roomService.joinRoom(roomId);
        $scope.multipleCanvasEnabled = true;
    };

    $scope.leaveRoom = function() {
        roomService.leaveRoom();
    };

    $scope.getUserId = function() {
        return userService.getUserId();
    };

    $scope.getRoomUserCount = function() {
        var num = roomService.getUsersInRoom();
        return num.length;
    };

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        //when the observer is routed then reroute to the observer version of that page
        if (next.indexOf('question') !== -1) {
            console.log("should be going to question");
            $location.path('/observeQ');
        } else if (next.indexOf('vote') !== -1) {
            console.log("should be going to voting");
            $location.path('/observeV');
        }
    });


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