/**
 * Created by alexeykastyuk on 3/21/16.
 */
app.factory('profileService', ['$http', function ($http) {
    return {
        getFullInformation: function () {
            return $http.get('/user/info');
        }
    }
}])