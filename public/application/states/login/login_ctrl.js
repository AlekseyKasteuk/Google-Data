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
            templateUrl: 'application/modal_dialogs/create_new_account/create_new_account.html',
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
}]);