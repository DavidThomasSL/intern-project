ClonageApp.controller("signupController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.submitName = function(form) {
        //todo validate input field
        userService.setName(form.enteredName);
    };
});
