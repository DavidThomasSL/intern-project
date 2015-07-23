ClonageApp.service('RoutingService', ['socket', '$location', function(socket, $location) {

    socket.on("ROUTING", function(msg) {
        console.log("sending user to room");

        if (msg.location === 'room') {
            $location.path('/room');
        } else if (msg.location === 'joining') {
            $location.path('/joining');
        } else if(msg.location === 'question') {
        	$location.path('/question');
        } else if(msg.location === 'vote') {
            $location.path('/vote');
        } else if(msg.location === 'wait') {
            $location.path('/wait');
        } else if(msg.location === 'results') {
            $location.path('/results');
        }
    });

    return null;
}]);
