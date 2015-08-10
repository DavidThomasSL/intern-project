ClonageApp.controller("signupController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

	// Scope given to the userCanvasDirective, which attaches a getCanvasData function to it
	// This can be used to get the canvas data
	$scope.joinCanvasControl = {};

	// sends the user name and their drawing
	$scope.submitName = function(form) {
		// Get the user drawing from the canvas
		var userDrawing = $scope.joinCanvasControl.getCanvasData();
		userService.setNameAndImage(form.enteredName, userDrawing);
	};

});
