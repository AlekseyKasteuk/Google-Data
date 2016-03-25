/**
 * Created by alexeykastyuk on 3/22/16.
 */
app.controller('createNewAccountCtrl', ['$scope', '$mdDialog', 'authService', function ($scope, $mdDialog, authService) {
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

        });
    };
}]);