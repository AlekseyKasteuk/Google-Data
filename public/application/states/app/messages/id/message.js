/**
 * Created by alexeykastyuk on 4/25/16.
 */
app.controller('MessageCtrl', ['$scope', '$stateParams', 'messageService', function ($scope, $stateParams, messageService) {

    messageService.toggleThreadLabel([{
        userId: 'me',
        id: $stateParams.id,
        resource: {
            removeLabelIds: ['UNREAD']
        }
    }]).success(function () {

    });

    messageService.getMessage($stateParams.id).success(function (result) {
        console.log(result);
        $scope.thread = result;
    });

}]);