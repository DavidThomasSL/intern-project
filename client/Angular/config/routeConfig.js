ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/includes/templates/set_name.html'
            })
            .when('/joining', {
                templateUrl: '/includes/templates/join_create_room.html'
            })
            .when('/room/', {
                templateUrl: '/includes/templates/room_lobby.html'
            })
            .when('/question/', {
                templateUrl: '/includes/templates/game_question.html'
            })
            .when('/vote/', {
                templateUrl: '/includes/templates/vote_favourite.html'
            })
            .when('/wait/', {
                templateUrl: '/includes/templates/wait.html'
            })
            .when('/results/', {
                templateUrl: '/includes/templates/results.html'
            })
            .when('/endGame/', {
                templateUrl: '/includes/templates/endGame.html'
            })
            .otherwise({
                templateUrl: '/includes/templates/setname.html'
            });

    }
]);
