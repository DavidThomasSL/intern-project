ClonageApp.service('RoutingService', ['socket', '$location', function(socket, $location) {

    socket.on("ROUTING", function(msg) {
        console.log("sending user to room");

        if (msg.location === 'room') {
            $location.path('/room');
        } else if (msg.location === 'joining') {
            $location.path('/joining');
        } else if(msg.location === 'question') {
            console.log("chaning path");
        	$location.path('/question');
        }
    });

    return null;
}]);
