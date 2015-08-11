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
		template: "<canvas width='300' height='300'/>",
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

			// Get the user's image (if they drew one)
			imageData = scope.internalControl.getUserImage();
			if (imageData.objects[0].text === "Draw your icon here!") {
				imageData.objects[0].text = "I was too lazy to draw\n my own picture so I\n got this instead";
				imageData.objects[0].left = 0;
			}

			canvas.loadFromDatalessJSON(imageData, function() {
				scaleCanvas(0.5, 0.5);
			});

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
