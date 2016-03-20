/**
 * Created by alexeykastyuk on 3/18/16.
 */
var app = angular.module('GoogleData', [
    'ui.router'
]);

app.config(['$httpProvider', '$urlRouterProvider', '$stateProvider', '$locationProvider', function($httpProvider, $urlRouterProvider, $stateProvider, $locationProvider) {

        //$httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'application/states/login/login.html',
                controller: 'LoginCtrl'
            })
        	.state('app', {
        		url: '/',
        		templateUrl: 'application/states/app/app.html',
        		controller: 'AppCtrl'
        	})
    }
])


app.run(['$rootScope', '$state', '$stateParams', '$location', function ($rootScope, $state, $stateParams, $location) {
	$rootScope.$on('$stateChangeStart', function () {

	});
}]);