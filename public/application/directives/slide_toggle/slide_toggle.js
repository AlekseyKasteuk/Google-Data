/**
 * Created by alexeykastyuk on 4/16/16.
 */
app.directive('slideToggle', function() {
    return {
        restrict: 'A',
        scope: false ,
        link: function(scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            var toggle = attr.slideToggle ;
            $(element).hide();

            scope.$watch(toggle, function(newVal,oldVal) {
                if(newVal !== oldVal){
                    !!newVal ? $(element).slideDown(slideDuration) : $(element).slideUp(slideDuration);
                }
            });
        }
    };
});