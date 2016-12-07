/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.controller('createInnerCalendarCtrl', ['$scope', 'innerCalendarServ', '$mdDialog', function ($scope, innerCalendarServ, $mdDialog) {
    $scope.calendar = {};

    $scope.create = function () {

        console.log($scope.calendar);
        if ($scope.calendar.name && $scope.calendar.color) {
            innerCalendarServ.create($scope.calendar).success(function () {
                $mdDialog.hide();
            })
        }

    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    }

}]);