/**
 * Created by alexeykastyuk on 3/23/16.
 */
app.controller('ProfileDlgCtrl', ['$scope', '$mdDialog', 'uploadFileService', '$timeout', function ($scope, $mdDialog, uploadFileService, $timeout) {

    $scope.close = function () {
        $mdDialog.cancel();
    };

    $scope.upload = function (dataUrl, name) {
        $scope.enableSpinner = true;
        uploadFileService(dataUrl, '/profile/avatar', name).then(function () {
            $timeout(function () {
                $scope.enableSpinner = false;
                $mdDialog.hide();
            }, 1000);
        }, function () {
            $scope.enableSpinner = false;
        })
    }

}]);