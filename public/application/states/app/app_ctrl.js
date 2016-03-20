/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('AppCtrl', ['$scope', 'socket', '$http', '$window', function ($scope, socket, $http, $window) {
    $scope.name = 'Alexey'
    $scope.test = function () {
        $http.post('/login', {username: 'alex', password: 'alexey22'})
        //socket.emit('login', {username: 'alex', password: 'alexey22'});
    }
    $scope.test2 = function () {
        $http.post('/logout');
        //socket.emit('logout')
    }
    $scope.test3 = function () {
        socket.emit('test');
    }
    $scope.test4 = function () {
        $window.location.href = '/google';
    }
    socket.on('authorization_faild', function (data) {
        console.log('authorization_faild',data);
    })
}]);
