ClonageApp.directive('userDrawing', function() {

	// used so each canvas element has a different id
	// each directive then binds the fabric canvas to that unqiue canvas
	var uniqueId = 0;

	return {

		scope: {
			control: '='
		},
		transclude: true,
		replace: true,
		restrict: 'E', // E = Element
		template: "<canvas width='300' height='300' style=\"border:1px solid #000;padding-left: 0;padding-right: 0;margin-left: auto;margin-right: auto;display: block;\"/>",
		link: function(scope, element, attrs) {

			// Number of possible drawing colors;
			var NUMCOLORS = 25;
			var rand = Math.floor((Math.random() * NUMCOLORS));
			var canvas;
			var thisId = uniqueId;
			uniqueId++;

			// define an internal scope, bound to the scope given to the directive on creation
			// acts as a public API for this directive
			scope.internalControl = scope.control || {};

			// get a reference to the canvas element
			var canvasElement = element;
			canvasElement.attr('id', 'user-canvas-' + thisId);

			//Create the canvas for the user to draw on
			canvas = new fabric.Canvas('user-canvas-' + thisId, {
				isDrawingMode: true
			});

			canvas.freeDrawingBrush.color = rainbow(NUMCOLORS, rand);
			canvas.freeDrawingBrush.width = 7;

			//Add instructional text
			var text = new fabric.Text('Draw your icon here!', {
				left: 15,
				top: 120,
				textAlign: 'center',
				fontSize: 30,
				fontFamily: 'Roboto'
			});
			canvas.add(text);

			//Remove text when drawing starts
			canvas.on('mouse:down', function(options) {
				canvas.remove(text);
			});

			/*
				DIRECTIVE PUBLIC API
				These functions can be called by the controller that exposes a scope to this directive
			*/

			// Returns the data from the canvas, i.e the user drawing
			// Returns as a json object
			scope.internalControl.getCanvasData = function() {
				return canvas.toDatalessJSON();
			};

			// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
			// Adam Cole, 2011-Sept-14
			// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
			function rainbow(numOfSteps, step) {

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
		}
	};
});
