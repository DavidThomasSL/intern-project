ClonageApp.service('RoutingService', ['socket', '$location', function(socket, $location) {

    socket.on("ROUTING", function(msg) {

        switch(msg.location) {
            case 'room':
                $location.path('/room');
                break;
            case 'joining':
                $location.path('/joining');
                break;
            case 'question':
                $location.path('/question');
                break;
            case 'vote':
                $location.path('/vote');
                break;
            case 'answerWait':
                $location.path('/answerWait');
                break;
            default :
                //if route message is not recognised
                alert('Error - cannot route to ' + msg.location);
        }
    });
    return null;
}]);
