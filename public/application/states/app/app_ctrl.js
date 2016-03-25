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

    $scope.tinymceOptions = {
        onChange: function(e) {
            console.log(e);
        },
        inline: false,
        plugins : [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks fullscreen media',
            'insertdatetime table contextmenu paste'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
        skin: 'lightgray',
        theme : 'modern',
        statusbar: false,
        width: 450,
        height: 455
    };
}]);
