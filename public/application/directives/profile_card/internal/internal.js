/**
 * Created by alexeykastyuk on 3/25/16.
 */
app.directive('profileCardInternal', ['$mdDialog', function($mdDialog) {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/application/directives/profile_card/internal/internal.html',
        link: function ($scope, element) {

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