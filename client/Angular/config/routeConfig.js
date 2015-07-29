ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/includes/templates/signup/set_name.html'
            })
            .when('/joining', {
                templateUrl: '/includes/templates/signup/join_create_room.html'
            })
            .when('/room/', {
                templateUrl: '/includes/templates/room/room_lobby.html'
            })
            .when('/question/', {
                templateUrl: '/includes/templates/game/game_question.html'
            })
            .when('/vote/', {
                templateUrl: '/includes/templates/game/vote_favourite.html'
            })
            .when('/waitVote/', {
                templateUrl: '/includes/templates/game/wait_vote.html'
            })
            .when('/results/', {
                templateUrl: '/includes/templates/game/results.html'
            })
            .when('/endGame/', {
                templateUrl: '/includes/templates/game/endGame.html'
            })
            .when('/waitQuestion', {
                templateUrl: '/includes/templates/game/wait_question.html'
            })
            .otherwise({
                templateUrl: '/includes/templates/game/setname.html'
            });

    }
]);
