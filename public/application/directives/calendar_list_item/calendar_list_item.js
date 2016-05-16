/**
 * Created by alexeykastyuk on 5/16/16.
 */
app.directive('calendarListItem', [function () {
    return {
        restrict: 'AE',
        scope: {
            calendarListItem: '=',
            calendarSection: '@'
        },
        templateUrl: '/application/directives/calendar_list_item/calendar_list_item.html'
    }
}]);