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

			canvas.freeDrawingBrush.color = getRandomColor();
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

			function getRandomColor() {

				var colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#3F51B5', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'];
				var colIndex = Math.floor(Math.random() * colors.length);

				return colors[colIndex];


			}
		}
	};
});
