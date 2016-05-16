/**
 * Created by alexeykastyuk on 3/25/16.
 */
app.directive('profileCardInternal', ['$mdDialog', 'profileService', function($mdDialog, profileService) {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/application/directives/profile_card/internal/internal.html',
        link: function ($scope, element) {

            function getInfo() {
                profileService.getProfileInfo('internal').success(function (user) {
                    $scope.user = user;
                    if (user.birth_date) {
                        $scope.user.birthYear = moment(user.birth_date).local().year();
                        $scope.user.birthMonth = moment.months(moment(user.birth_date).local().month());
                        $scope.user.birthDate = moment(user.birth_date).local().date();
                    }
                    console.log(user);
                }).error(function () {

                });
            }

            getInfo();

            $scope.selectAvatar = function () {
                $mdDialog.show({
                    controller: 'ProfileDlgCtrl',
                    templateUrl: 'application/modal_dialogs/profile/profile_dlg.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    fullscreen: true,
                    openFrom: angular.element(document.querySelector('#current-user-avatar')),
                    closeTo: angular.element(document.querySelector('#current-user-avatar'))
                }).then(function () {
                    getInfo();
                })
            };

            $scope.updateProfile = function () {

                if (!!$scope.user.birthYear && !!$scope.user.birthMonth && !!$scope.user.birthDate) {
                    var user = $scope.user;
                    $scope.user.birth_date = moment([user.birthDate, user.birthMonth, user.birthYear].join(' ')).format('YYYY-MM-DD');
                }
                profileService.updateInternalProfile($scope.user).success(function () {

                });
            }
        }
    }
}]);