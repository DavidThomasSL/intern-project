ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/includes/templates/signup/set_name.html',
                controller: 'signupController'
            })
            .when('/joining', {
                templateUrl: '/includes/templates/room/join_create_room.html',
                controller: 'roomController'

            })
            .when('/room/', {
                templateUrl: '/includes/templates/room/room_lobby.html',
                controller: 'roomController'
            })
            .when('/question/', {
                templateUrl: '/includes/templates/game/game_question.html',
                controller: 'gameController'

            })
            .when('/vote/', {
                templateUrl: '/includes/templates/game/vote_favourite.html',
                controller: 'gameController'

            })
            .when('/waitVote/', {
                templateUrl: '/includes/templates/game/wait_vote.html',
                controller: 'gameController'

            })
            .when('/results/', {
                templateUrl: '/includes/templates/game/results.html',
                controller: 'gameController'

            })
            .when('/endGame/', {
                templateUrl: '/includes/templates/game/endGame.html',
                controller: 'gameController'

            })
            .when('/waitQuestion/', {
                templateUrl: '/includes/templates/game/wait_question.html',
                controller: 'gameController'

            })
            .when('/observeLobby/', {
                templateUrl: '/includes/templates/observer/observer_lobby.html',
                controller: 'observerController'

            })
            .when('/observeQ/', {
                templateUrl: '/includes/templates/observer/observer_question.html',
                controller: 'observerController'

            })
            .when('/observeV/', {
                templateUrl: '/includes/templates/observer/observer_voting.html',
                controller: 'observerController'

            })
            .when('/observeR/', {
                templateUrl: '/includes/templates/observer/observer_results.html',
                controller: 'observerController'

            })
            .when('/observeEG/', {
                templateUrl: '/includes/templates/observer/observer_endGame.html',
                controller: 'observerController'

            })
            .otherwise({
                templateUrl: '/includes/templates/game/setname.html',

            });

    }
]);
