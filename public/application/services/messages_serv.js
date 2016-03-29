/**
 * Created by alexeykastyuk on 3/28/16.
 */
app.factory('messageService', ['$http', function ($http) {
    return {
        getThreads: function (labels) {
            return $http.post('/google/message/threads', {labels: labels});
        }
    }
}]);