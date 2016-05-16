/**
 * Created by alexeykastyuk on 5/14/16.
 */
app.controller('CalendarCtrl', ['$scope', 'calendarService', 'uiCalendarConfig', '$compile', function ($scope, calendarService, uiCalendarConfig, $compile) {

    $scope.calendars = {
        google: []
    };
    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.uiConfig = {
        calendar:{
            height: 850,
            header:{
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            viewRender: function (view, element) {
                calendarService.getCalendars(moment(view.intervalStart).format('YYYY-MM-DDTHH:mm:ss[Z]'), moment(view.intervalEnd).format('YYYY-MM-DDTHH:mm:ss[Z]')).success(function (result) {
                    console.log(result);
                    $scope.calendars.google = result.google.calendars.items;
                    $scope.events.splice(0, $scope.events.length - 1);
                    result.google.events.forEach(function (e) {
                        $scope.events.push(e);
                    });

                });
            },
            eventRender: function (event, element, view) {
                console.log('Event Render');
                element.attr({'tooltip': event.title,
                             'tooltip-append-to-body': true});
                $compile(element)($scope);
            }
        }
    };

    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(),
            end: new Date()
        });
    }

}]);
