/**
 * Created by alexeykastyuk on 3/25/16.
 */
app.directive('profileCard', ['profileService', '$timeout', '$stateParams', function(profileService, $timeout, $stateParams) {
    return {
        restrict: 'A',
        scope: {},
        templateUrl: '/application/directives/profile_card/profile_card.html',
        link: function ($scope, element) {
            var type = $stateParams.account ? $stateParams.account : 'internal';
            $scope.profile = {
                type: type
            };
            element.bind("animationend", function () {
                element.removeClass('rotated-profile-card')
            });
            $scope.changeProfileType = function (name) {
                element.addClass('rotated-profile-card');
                $timeout(function () {
                    $scope.profile.type = name;
                }, 500);

            };
        }
    }
}])