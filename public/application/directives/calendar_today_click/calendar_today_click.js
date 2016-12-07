/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.directive('calendarTodayClick', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            $(element).ready(function () {
                $timeout(function () {
                    $('.fc-today-button').click();
                }, 100);
            });
        }
    }
}]);