ClonageApp.service('RoutingService', ['socket', '$location', function(socket, $location) {

    socket.on("ROUTING", function(msg) {
        console.log("sending user to room");

        switch(msg.location){
            case 'room' :
                $location.path('/room');
                break;
            case 'joining' :
                $location.path('/joining');
                break;
            case 'question' :
                $location.path('/question');
                break;
            case 'vote' :
                $location.path('/vote');
                break;
            case 'waitVote' :
                $location.path('/waitVote');
                break;
            case 'results' :
                $location.path('/results');
                break;
            case 'endGame' :
                $location.path('/endGame');
                break;
            case 'waitQuestion' :
                $location.path('/waitQuestion');
        }
    });

    return null;
}]);
