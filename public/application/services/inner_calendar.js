/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.factory('innerCalendarServ', ['$http', function ($http) {
    return {
        create: function (calendar) {
            return $http.post('/calendar/inner/create', calendar);
        },
        createEvent: function (event) {
            return $http.post('/events/internal/create', event);
        }
    }
}]);