/**
 * Created by alexeykastyuk on 3/28/16.
 */
app.factory('messagesService', ['$http', function ($http) {
    return {
        getThreads: function (labels, pageToken) {
            return $http.post('/google/message/threads', {labels: labels, pageToken: pageToken});
        },

        sendEmail: function (sendMessage) {
            return $http.post('google/message/send', sendMessage);
        },

        removeThreads: function (ids) {
            return $http.post('/thread/list/delete', ids);
        }
    }
}]);