/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('MessageCtrl', ['$scope', '$stateParams', 'messageService', function ($scope, $stateParams, messageService) {
    var messageLabels = !!$stateParams.labels ? $stateParams.labels.split(',') : ['INBOX'];
    messageService.getThreads(messageLabels).success(function (result) {
        console.log(result);
    });
}]);