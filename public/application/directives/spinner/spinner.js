/**
 * Created by alexeykastyuk on 3/23/16.
 */
app.directive('spinner', function () {
    return {
        restrict: "E",
        scope: {},
        template: "<div><md-progress-circular md-mode='indeterminate' md-diameter='96'></md-progress-circular></div>"
    }
})