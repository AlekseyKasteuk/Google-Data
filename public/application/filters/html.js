/**
 * Created by alexeykastyuk on 5/10/16.
 */
app.filter('html', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);