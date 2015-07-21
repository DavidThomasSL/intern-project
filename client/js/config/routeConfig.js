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
            .otherwise({
                templateUrl: '/templates/setname.html'
            });

    }
]);