/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('AppCtrl', ['$scope', 'socket', '$state', 'authService', '$mdDialog', function ($scope, socket, $state, authService, $mdDialog) {
    $scope.logout = function () {
        authService.logout().success(function () {
            $state.go('login');
        });
    };
    socket.on('authorization_faild', function () {
        $state.go('login');
    });
}]);
