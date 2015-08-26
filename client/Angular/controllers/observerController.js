ClonageApp.controller("observerController", function($scope, $sce, $rootScope, $window, userService, roomService, RoutingService, gameService, $location, $timeout) {

    $scope.getUsersInRoom = roomService.getUsersInRoom; //List all the users in the lobby
    $scope.roomId = roomService.getRoomId; //Display room code in lobby
    $scope.getUserId = userService.getUserId; //Display user icon on card in lobby
    $scope.getActiveUsersInRoom = roomService.getActiveUsersInRoom;
    $scope.getObserversInRoom = roomService.getObserversInRoom;
    $scope.getBotsInRoom = roomService.getBotsInRoom;
    $scope.getGameParameters = roomService.getGameParameters;
    $scope.answers = gameService.getAnswers;
    $scope.currentVotes = gameService.getCurrentVotes;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;
    $scope.currentQuestion = gameService.getCurrentQuestion;
    $scope.currentRound = gameService.getCurrentRound;
    $scope.maxRounds = gameService.getMaxRounds;
    $scope.getPlayerRoundResults = gameService.getPlayerRoundResults;

    $scope.userPanelTemplate = "includes/templates/user/userPanelSmall.html";

    $scope.getMessages = roomService.getMessages;

    $scope.getUserFromId = roomService.getUserFromId;


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
        gameService.clearGameData();
    };

    $scope.getUserId = function() {
        return userService.getUserId();
    };

    // Use the sce service to allow us to inject html in a string straight to a page and render it
    $scope.bindHtml = function(text) {
        return $sce.trustAsHtml(text);
    };


    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        //when the observer is routed then reroute to the observer version of that page
        //indexOf used to test whether the target path contains the string
        if (next.indexOf('question') !== -1) {
            $location.path('/observeQ');
        } else if (next.indexOf('vote') !== -1) {
            $location.path('/observeV');
        } else if (next.indexOf('results') !== -1) {
            $location.path('/observeR');
        } else if (next.indexOf('endGame') !== -1) {
            $location.path('/observeEG')
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