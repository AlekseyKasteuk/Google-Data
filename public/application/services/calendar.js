/**
 * Created by alexeykastyuk on 5/15/16.
 */
app.factory('calendarService', ['$http', function ($http) {
    return {

        getCalendars: function (startDate, endDate) {
            console.log(startDate, endDate);
            return $http.get('/calendar/list?start=' + startDate + '&end=' + endDate);
        }

    }
}]);