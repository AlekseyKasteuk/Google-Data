/**
 * Created by alexeykastyuk on 3/21/16.
 */
app.factory('profileService', ['$http', function ($http) {
    return {
        getProfileInfo: function (name) {
            return $http.get('/user/info?profile=' + name);
        },
        updateCurrentGoogleAccount: function (id) {
            console.log(id);
            return $http.put('/google/update', {id : id});
        },
        updateInternalProfile: function (data) {
            return $http.put('/profile/internal/update', data);
        }
    }
}])