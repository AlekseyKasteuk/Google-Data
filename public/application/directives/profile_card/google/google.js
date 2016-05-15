/**
 * Created by alexeykastyuk on 3/25/16.
 */
app.directive('profileCardGoogle', ['$mdDialog', '$window', 'profileService', function($mdDialog, $window, profileService) {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/application/directives/profile_card/google/google.html',
        link: function ($scope, element) {

            $scope.$watch('users', function () {
                if (!$scope.users) { $scope.currentUser = {} }
                var user = $scope.users.filter(function (user) {
                   return user.isCurrent;
                });
                $scope.currentUser = !!user.length ? user[0] : {};
                $scope.$watch('currentUser', function () {
                    profileService.updateCurrentGoogleAccount(!!$scope.currentUser ? $scope.currentUser.id : -1)
                        .success(function (result) {

                        })
                        .error(function () {

                        });
                });
                console.log($scope.currentUser);
            });

            function getInfo() {
                $scope.isSpinner = true;
                profileService.getProfileInfo('google').success(function (users) {
                    console.log(users);
                    $scope.users = users;
                }).error(function () {

                }).finally(function () {
                    $scope.isSpinner = false;
                });
            }

            getInfo();

            $scope.addNewGoogleAccount = function () {
                $window.location.href = '/google';
            };

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
        }
    }
}]);