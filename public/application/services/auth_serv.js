/**
 * Created by alexeykastyuk on 3/20/16.
 */
app.factory('authService', ['$http', function($http) {
    return {
        login: function (user) {
            return $http.post('/login', user);
        },
        logout: function () {
            return $http.post('/logout');
        },
        checkAuth: function () {
            return $http.get('/auth/check');
        },
        createNewAccount: function (user) {
            return $http.post('/create/account', user);
        }
    }
}])