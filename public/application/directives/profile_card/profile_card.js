/**
 * Created by alexeykastyuk on 3/25/16.
 */
app.directive('profileCard', ['profileService', '$timeout', function(profileService, $timeout) {
    return {
        restrict: 'A',
        scope: {},
        templateUrl: '/application/directives/profile_card/profile_card.html',
        link: function ($scope, element) {
            $scope.profile = {
                type: 'Internal'
            };
            element.bind("animationend", function () {
                element.removeClass('rotated-profile-card')
            })
            $scope.changeProfileType = function (name) {
                element.addClass('rotated-profile-card');
                $timeout(function () {
                    $scope.profile.type = name;
                }, 500);

            };
            function getInfo() {
                profileService.getFullInformation().success(function (user) {
                    console.log(user);
                    $scope.user = user;
                }).error(function () {

                });
            }

            getInfo();
        }
    }
}])