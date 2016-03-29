/**
 * Created by alexeykastyuk on 3/18/16.
 */
var app = angular.module('GoogleData', [
    'ui.router',
    'ui.tinymce',
    'ngMaterial',
    'ngMessages',
    'ngFileUpload',
    'ngImgCrop'
]);

app.config(['$httpProvider', '$urlRouterProvider', '$stateProvider', '$locationProvider', '$mdIconProvider', '$mdThemingProvider', function($httpProvider, $urlRouterProvider, $stateProvider, $locationProvider, $mdIconProvider, $mdThemingProvider) {

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
        .state('app.profile', {
            url: 'profile?account',
            templateUrl: 'application/states/app/profile/profile.html',
            controller: 'ProfileCtrl'
        })
        .state('app.messages', {
            url: 'messages?labels',
            templateUrl: 'application/states/app/messages/messages.html',
            controller: 'MessageCtrl'
        });

    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('indigo');
}]);


app.run(['$rootScope', '$state', '$stateParams', 'authService', function ($rootScope, $state, $stateParams, authService) {
    $rootScope.getRange = function (type, configs) {
        console.log(type, configs);
        configs = !!configs ? configs : {};
        if (type == 'birth year') {
            return _.range(moment().year(), moment().year() - 120);
        }
        if (type == 'birth month') {
            return moment.months();
        }
        if (type == 'birth date' && !!configs.year && !!configs.month) {
            return _.range(1, moment().year(configs.year).month(configs.month).daysInMonth() + 1);
        }
        return [];
    };
	$rootScope.$on('$stateChangeStart', function (evt, to, params) {
        authService.checkAuth().success(function (user) {
            $rootScope.authorizedUser = user;
            console.log(user);
			if(to.name == 'login') {
				$state.go('app');
			}
		}).error(function () {
            $rootScope.authorizedUser = undefined;
			if(to.name != 'login') {
				$state.go('login');
			}
		})
	});
}]);