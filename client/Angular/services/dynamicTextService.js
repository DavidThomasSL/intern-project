ClonageApp.service('dynamicTextService', function() {


	function getSubmissionState(currentQuestion, enteredAnswer, currentlySubmittedAnswers) {
		var readyToSend = false;

		var alreadySelected = false;
		currentlySubmittedAnswers.forEach(function(currentAnswer) {
			if (currentAnswer === enteredAnswer) {
				//if reselecting an answer remove it from the array to send
				alreadySelected = true;
				currentlySubmittedAnswers = currentlySubmittedAnswers.filter(function(answer) {
					return (enteredAnswer !== answer);
				});
			}
		});

		//if clicking a new answer, add it to the array to send
		if (!alreadySelected) {
			currentlySubmittedAnswers.push(enteredAnswer);
			if (currentlySubmittedAnswers.length === currentQuestion.pick) {
				readyToSend = true;
			}
		}
		var currentFilledInQuestion = fillInSelections(currentQuestion.text, currentlySubmittedAnswers);

		return {
			currentlySubmittedAnswers: currentlySubmittedAnswers,
			currentFilledInQuestion: currentFilledInQuestion,
			readyToSend: readyToSend
		};
	}

	//Used to dynamically fill in the blanks of the question as the player selects them
	function fillInSelections(questionText, currentSelections) {
		var outputText;
		outputText = questionText;
		var removedFullStops = [];

		//formatting selected answers so they can be put into the question
		currentSelections.forEach(function(selection) {
			var selectionToPush = selection.slice();
			//removing full stop at end of text
			if (selectionToPush.charAt(selectionToPush.length - 1) == ".") {
				selectionToPush = selectionToPush.slice(0, -1);
			}

			//add the HTML tags around the user's answer
			selectionToPush = "<b class='submitted-answer-text'>" + selectionToPush + "</b>";
			removedFullStops.push(selectionToPush);
		});

		//if the question has no blanks then just put the inserted answers at the end of the string
		//with commas for question requiring multiple e.g. "Create a Haiku"
		if (questionText.indexOf('_') === -1) {
			outputText += "\n";
			removedFullStops.forEach(function(selection) {
				outputText += (selection + ", ");
			});
			outputText = outputText.replace(/,\s*$/, ".");
			return outputText;
		} else {
			for (var i = 0; i < currentSelections.length; i++) {
				outputText = outputText.replace('_', removedFullStops[i]);
			}
		}
		return outputText;
	}

	return {
		getSubmissionState: getSubmissionState,
		fillInSelections: fillInSelections
	};
});
