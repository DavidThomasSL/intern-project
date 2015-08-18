ClonageApp.service('RoutingService', ['$location', 'communicationService', function($location, communicationService) {

    communicationService.registerListener("ROUTING", [{
        eventName: "",
        eventAction: _handleRouting
    }]);

    function _handleRouting(msg) {
        switch (msg.location) {
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
            case 'waitVote':
                $location.path('/waitVote');
                break;
            case 'results':
                $location.path('/results');
                break;
            case 'endGame':
                $location.path('/endGame');
                break;
            case 'waitQuestion':
                $location.path('/waitQuestion');
                break;
            case 'observeLobby':
                $location.path('/observeLobby');
                break;
            case 'observeQuestion':
                $location.path('/observeQuestion');
                break;
            case 'observeVoting':
                $location.path('/observeVoting');
                break;
            default:
                $location.path('/');
        }
    }

    return {
        _handleRouting: _handleRouting
    };
}]);