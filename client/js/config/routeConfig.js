ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/templates/set_name.html'
            })
            .when('/joining', {
                templateUrl: '/templates/join_create_room.html'
            })
            .when('/room/', {
                templateUrl: '/templates/room_lobby.html'
            })
            .when('/question/', {
                templateUrl: '/templates/game_question.html'
            })
            .when('/vote/', {
                templateUrl: '/templates/vote_favourite.html'
            })
            .when('/wait/', {
                templateUrl: '/templates/wait.html'
            })
            .when('/results/', {
                templateUrl: '/templates/results.html'
            })
            .when('/endGame/', {
                templateUrl: '/templates/endGame.html'
            })
            .otherwise({
                templateUrl: '/templates/setname.html'
            });

    }
]);
