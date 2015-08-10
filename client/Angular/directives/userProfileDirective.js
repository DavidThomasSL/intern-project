ClonageApp.directive('userProfile', function() {

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
			var canvas;
			var thisId = uniqueId;
			var canvasElement;
			var imageData;
			uniqueId++;

			// define an internal scope, bound to the scope given to the directive on creation
			// acts as a public API for this directive
			scope.internalControl = scope.control || {};

			// get a reference to the canvas element
			canvasElement = element;
			canvasElement.attr('id', 'user-profile-' + thisId);

			canvas = new fabric.StaticCanvas('user-profile-' + thisId, {
				isDrawingMode: false
			});

			imageData = scope.internalControl.getUserImage();

			canvas.loadFromDatalessJSON(imageData, function() {
				scaleCanvas(0.5,0.5);
			});

			/*
				DIRECTIVE PUBLIC API
				These functions can be called by the controller that exposes a scope to this directive
			*/

			// Given a json object of a drawing, draws it to the canvas
			scope.internalControl.drawCanvasImage = function(imageData) {
				canvas.loadFromDatalessJSON(imageData, function() {
					canvas.renderAll();
				});
			};

			function scaleCanvas(xScale, yScale) {
				// Get all the paths on the canvas
				var drawings = canvas.getObjects();

				if (drawings.length >= 1) {

					// Resize canvas
					var newXSize = canvas.width * xScale;
					var newYSize = canvas.height * yScale;

					canvas.setWidth(newXSize);
					canvas.setHeight(newYSize);

					// Resize each object
					drawings.forEach(function(obj) {
						var newLeft = obj.left * xScale;
						var newTop = obj.top * yScale;

						obj.scaleX = xScale;
						obj.scaleY = yScale;
						obj.left = newLeft;
						obj.top = newTop;
					});

					//Update the Canvas
					canvas.renderAll();
				}
			}

		}
	};
});
