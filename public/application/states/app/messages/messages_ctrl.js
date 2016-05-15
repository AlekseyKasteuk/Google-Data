/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('MessagesCtrl', ['$scope', '$stateParams', 'messagesService', '$state', 'messageService', function ($scope, $stateParams, messagesService, $state, messageService) {
    var messageLabels = !!$stateParams.labels ? $stateParams.labels.split(',') : ['INBOX'];
    $scope.threads = [];
    $scope.currentPage = 1;
    $scope.maxPage = 1;
    $scope.count = 50;
    var getThreads = function (nextPageToken) {
        $scope.isSpinner = true;
        messagesService.getThreads(messageLabels, nextPageToken).success(function (result) {
            $scope.nextPageToken = result.nextPageToken;
            $scope.threads = $scope.threads.concat(result.threads);
            $scope.threadsCount = result.threadsCount;
            console.log(result);
        }).finally(function () {
            $scope.isSpinner = false;
        });
    };

    $scope.goToPage = function (config) {

        console.log(config);

        if (config.back) {
            if ($scope.currentPage > 1) { $scope.currentPage--; }
        } else if (config.forward) {
            if ($scope.currentPage <= $scope.maxPage || !!$scope.nextPageToken) {
                if ($scope.currentPage == $scope.maxPage) {
                    getThreads($scope.nextPageToken);
                    $scope.maxPage = $scope.currentPage + 1;
                }
                $scope.currentPage++;
            }
        }

    };

    $scope.toggleLabel = function (thread, label) {

        var index = thread.labels.indexOf(label);
        console.log(thread);

        messageService.toggleThreadLabel(index == -1 ? [{
            resource: {
                addLabelIds: [label],
                removeLabelIds: []
            },
            id: thread.id,
            userId: 'me'
        }] : [{
            resource: {
                removeLabelIds: [label],
                addLabelIds: []
            },
            id: thread.id,
            userId: 'me'
        }]).success(function () {
            console.log('Change label', index);
            index == -1 ? thread.labels.push(label) : thread.labels.splice(index, 1);
            console.log(thread);
        });
    };

    getThreads();

    $scope.refreshData = function () {
        $scope.currentPage = 1;
        $scope.maxPage = 1;
        $scope.nextPageToken = undefined;
        $scope.threads = [];
        getThreads();
    };

    $scope.tinymceOptions = {
        onChange: function(e) {
            console.log(e);
        },
        inline: false,
        plugins : [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks fullscreen media',
            'insertdatetime table contextmenu paste'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
        skin: 'lightgray',
        theme : 'modern',
        statusbar: false,
        width: 450,
        height: 350
    };

    $scope.newMessage = {
        recipients: [],
        isOpen: false
    };

    $scope.toggleNewMessage = function (open) {
        if ($scope.newMessage.isOpen !== open) {
            $scope.newMessage = {
                recipients: [],
                isOpen: false
            };
            $scope.newMessage.isOpen = open;
        }
    };

    $scope.sendMessage = function () {
        messagesService.sendEmail($scope.newMessage).success(function (res) {
            console.log(res);
        }).error(function () {
            console.log(arguments);
        });
    };

    $scope.getSenderOrRecepient = function (thread) {
        if (messageLabels.indexOf('SENT') != -1) {
            return 'To: ' + thread.fromTo.to.map(function(f) {
                    var label = !!f.name ? f.name : f.email;
                    return f.count > 1 ? label + ' (' + f.count + ')' : label;
                }).join(', ');
        } else {
            return thread.fromTo.from.map(function(f) {
                var label = !!f.name ? f.name : f.email;
                return f.count > 1 ? label + ' (' + f.count + ')' : label;
            }).join(', ');
        }
    }

    $scope.grandSelection = function () {
        $scope.threads.forEach(function (thread) {
            thread.isSelected = $scope.grandSelect;
        })
    }

    $scope.messageSelect = function () {
        for (var i = 0; i < $scope.threads.length; i++) {
            if (!$scope.threads[i].isSelected) { $scope.grandSelect = false; return; }
        }
        $scope.grandSelect = true;
    }
    
    $scope.unreadLabelToggle = function (unreadLabel) {
        console.log('Unread');
        var selectedThreads = $scope.threads.filter(function (thread) {
            return !!thread.isSelected;
        });

        messageService.toggleThreadLabel(selectedThreads.map(function (thread) {
            return {
                id: thread.id,
                userId: 'me',
                resource: {
                    addLabelIds: unreadLabel ? ['UNREAD'] : [],
                    removeLabelIds: !unreadLabel ? ['UNREAD'] : []
                }
            }
        })).success(function () {
            selectedThreads.forEach(function (thread) {
                thread.isSelected = false;
                var index = thread.labels.indexOf('UNREAD');
                if (index == -1 && unreadLabel) {
                    thread.labels.push('UNREAD');
                } else if (index != -1 && !unreadLabel) {
                    thread.labels.splice(index, 1);
                }
            });
        });

    }

    $scope.removeThreads = function () {
        messagesService.removeThreads($scope.threads.filter(function (thread) {
            return !!thread.isSelected;
        }).map(function (thread) {
            return thread.id;
        })).success(function () {
            $scope.refreshData();
        });
    }

}]);