ClonageApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/templates/setname.html'
            })
            .when('/joining', {
                templateUrl: '/templates/joining.html'
            })
            .when('/room/', {
                templateUrl: '/templates/room.html'
            })
            .when('/question/', {
                templateUrl: '/templates/question.html'
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
