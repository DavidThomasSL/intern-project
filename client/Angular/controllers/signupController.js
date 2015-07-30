ClonageApp.controller("signupController", function($scope, userService, roomService, RoutingService, gameService, $location, $sessionStorage) {

    $scope.canvas = {};

	var NUMCOLORS = 50;

	//sends the user name and their drawing
    $scope.submitName = function(form) {
        //todo validate input field
        var userDrawing = $scope.canvas.toDatalessJSON();
        userService.setNameAndImage(form.enteredName, userDrawing);
    };

    //Sets up a fabric canvas element that the user can draw on
	$scope.init = function() {
		$scope.canvas = new fabric.Canvas('user-canvas', {
			isDrawingMode: true,
		});
		var rand = Math.floor((Math.random() * NUMCOLORS));
		$scope.canvas.freeDrawingBrush.color = rainbow(NUMCOLORS, rand);
		$scope.canvas.freeDrawingBrush.width = 7;
	};

	$scope.init();

	function rainbow(numOfSteps, step) {
		// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
		// Adam Cole, 2011-Sept-14
		// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
		var r, g, b;
		var h = step / numOfSteps;
		var i = ~~(h * 6);
		var f = h * 6 - i;
		var q = 1 - f;
		switch (i % 6) {
			case 0:
				r = 1;
				g = f;
				b = 0;
				break;
			case 1:
				r = q;
				g = 1;
				b = 0;
				break;
			case 2:
				r = 0;
				g = 1;
				b = f;
				break;
			case 3:
				r = 0;
				g = q;
				b = 1;
				break;
			case 4:
				r = f;
				g = 0;
				b = 1;
				break;
			case 5:
				r = 1;
				g = 0;
				b = q;
				break;
		}
		var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
		return (c);
	}
});
