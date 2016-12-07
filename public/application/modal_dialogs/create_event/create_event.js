/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.controller('createEventCtrl', ['$scope', '$mdDialog', 'calendarData', 'innerCalendarServ', function ($scope, $mdDialog, calendarData, innerCalendarServ) {

    console.log(calendarData);

    $scope.event = {
        start: calendarData.start.toDate(),
        end: calendarData.start.clone().add(1, 'd').toDate(),
        allDay: true
    };

    $scope.calendarConfigs = calendarData;


    $scope.cancel = function () {
        $mdDialog.cancel();
    }

    $scope.save = function () {

        if ($scope.calendarType == 'internal') {
            console.log($scope.event);

            var event = angular.copy($scope.event);

            event.start = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
            event.end = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
            event.color = event.calendar.backgroundColor || 'blue';
            event.all_day = event.allDay;
            event.calendar = event.calendar.id;

            innerCalendarServ.createEvent(event).success(function () {
                $mdDialog.hide();
            });

        } else if ($scope.calendarType == 'google') {

        }

    }

}]);