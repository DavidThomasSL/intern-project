ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/templates/set_name_test.html'
            })
            .when('/joining', {
                templateUrl: '/templates/join_create_room_test.html'
            })
            .when('/room/', {
                templateUrl: '/templates/room_lobby_test.html'
            })
            .when('/question/', {
                templateUrl: '/templates/game_question_test.html'
            })
            .when('/vote/', {
                templateUrl: '/templates/vote.html'
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
