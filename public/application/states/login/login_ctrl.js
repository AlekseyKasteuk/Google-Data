/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('LoginCtrl', ['$scope', 'authService', '$mdDialog', '$state', '$mdToast', function ($scope, authService, $mdDialog, $state, $mdToast) {
    $scope.user = {}

    $scope.login = function () {
        authService.login($scope.user).success(function () {
            $state.go('app');
        }).error(function (message) {
            $mdToast.show($mdToast.simple()
                .textContent(message)
                .action('OK')
                .highlightAction(false)
                .position('top left'));
        })
    };
    $scope.showAlert = function (event) {
        $mdDialog.show({
            controller: 'createNewAccountCtrl',
            templateUrl: 'application/states/login/create_new_account.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function(user) {
            $mdToast.show($mdToast.simple()
                .textContent(user + ' was created')
                .action('OK')
                .highlightAction(false)
                .position('top left'));
        });
    }
}])

.controller('createNewAccountCtrl', ['$scope', '$mdDialog', 'authService', function ($scope, $mdDialog, authService) {
    $scope.user = {}
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function() {
        authService.createNewAccount($scope.user).success(function () {
            $mdDialog.hide($scope.user.first_name + ' ' + $scope.user.last_name);
        }).error(function () {

        })
        //$mdDialog.hide();
    };
}]);