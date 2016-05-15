/**
 * Created by alexeykastyuk on 4/30/16.
 */
app.factory('messageService', ['$http', function ($http) {
    return {
        getMessage: function (id) {
            return $http.get('/google/thread/' + id);
        },
        toggleThreadLabel: function (data) {
            return $http.put('/thread/label/toggle', { data: data });
        }
    }
}]);