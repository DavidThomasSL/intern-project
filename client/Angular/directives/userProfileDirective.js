ClonageApp.directive('userProfile', function() {

	// used so each canvas element has a different id
	// each directive then binds the fabric canvas to that unqiue canvas
	var uniqueId = 0;

	return {

		scope: {
			sizex: '=',
			sizey: '=',
			image: '=',
			isbot: '='
		},
		transclude: true,
		replace: true,
		restrict: 'E', // E = Element
		template: "<canvas width='300' height='300'/>",
		link: function(scope, element, attrs) {

			// Number of possible drawing colors;
			var canvas;
			var defaultSize = 300; //the size of the canvas on the signup page, used for scaling
			var thisId = uniqueId;
			var canvasElement;
			var imageData;
			uniqueId++;

			// get a reference to the canvas element
			canvasElement = element;
			canvasElement.attr('id', 'user-profile-' + thisId);

			canvas = new fabric.StaticCanvas('user-profile-' + thisId, {
				isDrawingMode: false
			});

			// Watch the user image to see if it changes
			// needed if the directive loads before the controller, meaning the user image is not defined yet
			// this is the case in the navbar in the index
			scope.$watch("image", function(newValue, oldValue, scope) {
				if (newValue) {
					loadImage(newValue);
				}
			});

			// if the image is a bot
			// we load the image as a url, not as a js
			if (scope.isbot) {
				// get the image from the bot image url
				fabric.Image.fromURL('../../includes/images/bot_icon.png', function(oImg) {
					canvas.add(oImg);
					scaleCanvas(scope.sizex, scope.sizey);
				});
			}

			function loadImage(imageData) {
				// draw the user's image (if they drew one)
				if (imageData.objects[0].text === "Draw your icon here!") {
					imageData.objects[0].text = "I was too lazy to draw\n my own picture so I\n got this instead";
					imageData.objects[0].left = 0;
				}

				// Load the canvas, and scale the image to the particular size we want, given in the directive markup
				canvas.loadFromDatalessJSON(imageData, function() {
					scaleCanvas(scope.sizex, scope.sizey);
				});
			}

			// Given a target size of canvas, scale the images to fit that
			function scaleCanvas(newWidth, newHeight) {
				// Get all the paths on the canvas
				var drawings = canvas.getObjects();

				if (drawings.length >= 1) {

					// get the scaling
					var scaleX = newWidth / 300;
					var scaleY = newHeight / 300;

					// Resize canvas
					canvas.setWidth(newWidth);
					canvas.setHeight(newHeight);

					// Resize each object
					drawings.forEach(function(obj) {
						var newLeft = obj.left * scaleX;
						var newTop = obj.top * scaleY;

						obj.scaleX = scaleX;
						obj.scaleY = scaleY;
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
