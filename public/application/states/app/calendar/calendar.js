/**
 * Created by alexeykastyuk on 5/14/16.
 */
app.controller('CalendarCtrl', ['$scope', 'calendarService', 'uiCalendarConfig', '$compile', '$mdDialog', function ($scope, calendarService, uiCalendarConfig, $compile, $mdDialog) {

    $('.fc-today-button').click();

    var view;
    var getData = function () {
        calendarService.getCalendars(moment(view.intervalStart).format('YYYY-MM-DDTHH:mm:ss[Z]'), moment(view.intervalEnd).format('YYYY-MM-DDTHH:mm:ss[Z]')).success(function (result) {
            console.log(result);
            $scope.calendars.google = result.google.calendars.items;
            $scope.calendars.internal = result.inner.calendars;
            $scope.events.splice(0, $scope.events.length - 1);
            result.google.events.forEach(function (e) {
                $scope.events.push(e);
            });
            result.inner.events.forEach(function (e) {
                $scope.events.push(e);
            });

        });
    };

    var createEvent = function (date) {

        $mdDialog.show({
            controller: 'createEventCtrl',
            templateUrl: 'application/modal_dialogs/create_event/create_event.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true,
            locals: {
                calendarData: {

                        internalCalendars: $scope.calendars.internal,
                        googleCalendars: $scope.calendars.google.filter(function (cal) {
                            return cal.accessRole == 'owner';
                        }),
                        start: date

                    }
            }
        })
        .then(function() {
            getData();
        });

    };

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
            viewRender: function (v, element) {
                view = v;
                getData();
            },
            eventRender: function (event, element, view) {
                console.log('Event Render');
                element.attr({'tooltip': event.title,
                             'tooltip-append-to-body': true});
                $compile(element)($scope);
            },
            dayClick: function (date) {
                createEvent(date);
            }
        }
    };

    $scope.createInnerCalendar = function () {
        $mdDialog.show({
            controller: 'createInnerCalendarCtrl',
            templateUrl: 'application/modal_dialogs/create_inner_calendar/create_inner_calendar.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function() {
            getData();
        });
    };

    $scope.createGoogleCalendar = function () {

    }

}]);
