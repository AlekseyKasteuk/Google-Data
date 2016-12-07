/**
 * Created by alexeykastyuk on 3/18/16.
 */
var app = angular.module('GoogleData', [
    'ui.router',
    'ui.tinymce',
    'ngMaterial',
    'ngMessages',
    'ngFileUpload',
    'ngImgCrop',
    'ui.calendar'
]);

app.config(['$httpProvider', '$urlRouterProvider', '$stateProvider', '$locationProvider', '$mdIconProvider', '$mdThemingProvider', function($httpProvider, $urlRouterProvider, $stateProvider, $locationProvider, $mdIconProvider, $mdThemingProvider) {

    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $urlRouterProvider.otherwise('/profile');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'application/states/login/login.html',
            controller: 'LoginCtrl'
        })
        .state('app', {
            url: '/',
            templateUrl: 'application/states/app/app.html',
            controller: 'AppCtrl',
            redirectTo: 'app.profile'
        })
        .state('app.profile', {
            url: 'profile?account',
            templateUrl: 'application/states/app/profile/profile.html',
            controller: 'ProfileCtrl'
        })
        .state('app.messages', {
            url: 'messages?labels',
            templateUrl: 'application/states/app/messages/messages.html',
            controller: 'MessagesCtrl'
        })
        .state('app.message', {
            url: 'messages/:id',
            templateUrl: 'application/states/app/messages/id/message.html',
            controller: 'MessageCtrl'
        })
        .state('app.calendar', {
            url: 'calendar',
            templateUrl: 'application/states/app/calendar/calendar.html',
            controller: 'CalendarCtrl'
        });

    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('indigo');
}]);


app.run(['$rootScope', '$state', '$stateParams', 'authService', function ($rootScope, $state, $stateParams, authService) {
    $rootScope.getRange = function (type, configs) {
        configs = !!configs ? configs : {};
        if (type == 'birth year') {
            return _.range(moment().year(), moment().year() - 120);
        }
        if (type == 'birth month') {
            return moment.months();
        }
        if (type == 'birth date' && !!configs.year && !!configs.month) {
            return _.range(1, moment().year(configs.year).month(configs.month).daysInMonth() + 1);
        }
        return [];
    };
	$rootScope.$on('$stateChangeStart', function (evt, to, params) {

        authService.checkAuth().success(function (user) {
            $rootScope.authorizedUser = user;

            if (to.redirectTo) {
                console.log(to.redirectTo);
                $state.go(to.redirectTo, params);
                return;
            }

			if(to.name == 'login') {
				$state.go('app');
			}
		}).error(function () {
            $rootScope.authorizedUser = undefined;
			if(to.name != 'login') {
				$state.go('login');
			}
		});
	});
}]);
/**
 * Created by alexeykastyuk on 3/20/16.
 */
app.factory('authService', ['$http', function($http) {
    return {
        login: function (user) {
            return $http.post('/login', user);
        },
        logout: function () {
            return $http.post('/logout');
        },
        checkAuth: function () {
            return $http.get('/auth/check');
        },
        createNewAccount: function (user) {
            return $http.post('/create/account', user);
        }
    }
}])
/**
 * Created by alexeykastyuk on 5/15/16.
 */
app.factory('calendarService', ['$http', function ($http) {
    return {

        getCalendars: function (startDate, endDate) {
            console.log(startDate, endDate);
            return $http.get('/calendar/list?start=' + startDate + '&end=' + endDate);
        }

    }
}]);
/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.factory('innerCalendarServ', ['$http', function ($http) {
    return {
        create: function (calendar) {
            return $http.post('/calendar/inner/create', calendar);
        },
        createEvent: function (event) {
            return $http.post('/events/internal/create', event);
        }
    }
}]);
/**
 * Created by alexeykastyuk on 4/30/16.
 */
app.factory('messageService', ['$http', function ($http) {
    return {
        getMessage: function (id) {
            return $http.get('/google/thread/' + id);
        },
        toggleThreadLabel: function (data) {
            return $http.put('/thread/label/toggle', { data: data });
        }
    }
}]);
/**
 * Created by alexeykastyuk on 3/28/16.
 */
app.factory('messagesService', ['$http', function ($http) {
    return {
        getThreads: function (labels, pageToken) {
            return $http.post('/google/message/threads', {labels: labels, pageToken: pageToken});
        },

        sendEmail: function (sendMessage) {
            return $http.post('google/message/send', sendMessage);
        },

        removeThreads: function (ids) {
            return $http.post('/thread/list/delete', ids);
        }
    }
}]);
/**
 * Created by alexeykastyuk on 3/21/16.
 */
app.factory('profileService', ['$http', function ($http) {
    return {
        getProfileInfo: function (name) {
            return $http.get('/user/info?profile=' + name);
        },
        updateCurrentGoogleAccount: function (id) {
            console.log(id);
            return $http.put('/google/update', {id : id});
        },
        updateInternalProfile: function (data) {
            return $http.put('/profile/internal/update', data);
        }
    }
}])
/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}]);
/**
 * Created by alexeykastyuk on 3/22/16.
 */
app.factory('uploadFileService', ['Upload', function (Upload) {
    return function (dataUrl, url, name) {
        console.log(Upload.dataUrltoBlob(dataUrl, name).toString());
        return Upload.upload({
            url: url,
            method: 'POST',
            data: {
                message: 'HELLO WORLD!'
            },
            file: Upload.dataUrltoBlob(dataUrl, name)
        });
    }
}])
/**
 * Created by alexeykastyuk on 5/10/16.
 */
app.filter('html', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
/**
 * Created by alexeykastyuk on 5/14/16.
 */
app.filter('pagination', [function () {
    return function (items, count, page) {
        page--;
        return items.slice(count * page, count * page + count);
    }
}]);
/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.directive('calendarTodayClick', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            $(element).ready(function () {
                $timeout(function () {
                    $('.fc-today-button').click();
                }, 100);
            });
        }
    }
}]);
/**
 * Created by alexeykastyuk on 4/30/16.
 */
app.directive('messageTypeChoice', [function () {
    return {
        restrict: 'A',
        templateUrl: '/application/directives/message_type_choice/message_type_choice.html'
    }
}]);
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
/**
 * Created by alexeykastyuk on 5/16/16.
 */
app.directive('calendarListItem', [function () {
    return {
        restrict: 'AE',
        scope: {
            calendarListItem: '=',
            calendarSection: '@',
            calendarCreateAction: '='
        },
        templateUrl: '/application/directives/calendar_list_item/calendar_list_item.html'
    }
}]);
/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.controller('createEventCtrl', ['$scope', '$mdDialog', 'calendarData', 'innerCalendarServ', function ($scope, $mdDialog, calendarData, innerCalendarServ) {

    console.log(calendarData);

    $scope.event = {
        start: calendarData.start.toDate(),
        end: calendarData.start.clone().add(1, 'd').toDate(),
        allDay: true
    };

    $scope.calendarConfigs = calendarData;


    $scope.cancel = function () {
        $mdDialog.cancel();
    }

    $scope.save = function () {

        if ($scope.calendarType == 'internal') {
            console.log($scope.event);

            var event = angular.copy($scope.event);

            event.start = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
            event.end = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
            event.color = event.calendar.backgroundColor || 'blue';
            event.all_day = event.allDay;
            event.calendar = event.calendar.id;

            innerCalendarServ.createEvent(event).success(function () {
                $mdDialog.hide();
            });

        } else if ($scope.calendarType == 'google') {

        }

    }

}]);
/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('LoginCtrl', ['$scope', 'authService', '$mdDialog', '$state', '$mdToast', function ($scope, authService, $mdDialog, $state, $mdToast) {
    $scope.user = {}

    $scope.login = function () {
        authService.login($scope.user).success(function () {
            $state.go('app');
        }).error(function (message) {
            $mdToast.show($mdToast.simple()
                .textContent(message)
                .action('OK')
                .highlightAction(false)
                .position('top left'));
        })
    };
    $scope.showAlert = function (event) {
        $mdDialog.show({
            controller: 'createNewAccountCtrl',
            templateUrl: 'application/modal_dialogs/create_new_account/create_new_account.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function(user) {
            $mdToast.show($mdToast.simple()
                .textContent(user + ' was created')
                .action('OK')
                .highlightAction(false)
                .position('top left'));
        });
    }
}]);
/**
 * Created by alexeykastyuk on 4/16/16.
 */
app.directive('slideToggle', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            var toggle = attr.slideToggle ;
            console.log(attr.slideToggleShowOnStart);
            if (!attr.slideToggleShowOnStart) {
                $(element).hide();
            }

            scope.$watch(toggle, function(newVal,oldVal) {
                if(newVal !== oldVal){
                    !!newVal ? $(element).slideDown(slideDuration) : $(element).slideUp(slideDuration);
                }
            });
        }
    };
});
/**
 * Created by alexeykastyuk on 3/22/16.
 */
app.controller('createNewAccountCtrl', ['$scope', '$mdDialog', 'authService', function ($scope, $mdDialog, authService) {
    $scope.user = {}
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function() {
        authService.createNewAccount($scope.user).success(function () {
            $mdDialog.hide($scope.user.first_name + ' ' + $scope.user.last_name);
        }).error(function () {

        });
    };
}]);
/**
 * Created by alexeykastyuk on 5/17/16.
 */
app.controller('createInnerCalendarCtrl', ['$scope', 'innerCalendarServ', '$mdDialog', function ($scope, innerCalendarServ, $mdDialog) {
    $scope.calendar = {};

    $scope.create = function () {

        console.log($scope.calendar);
        if ($scope.calendar.name && $scope.calendar.color) {
            innerCalendarServ.create($scope.calendar).success(function () {
                $mdDialog.hide();
            })
        }

    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    }

}]);
/**
 * Created by alexeykastyuk on 3/23/16.
 */
app.controller('ProfileDlgCtrl', ['$scope', '$mdDialog', 'uploadFileService', '$timeout', function ($scope, $mdDialog, uploadFileService, $timeout) {

    $scope.close = function () {
        $mdDialog.cancel();
    };

    $scope.upload = function (dataUrl, name) {
        $scope.enableSpinner = true;
        uploadFileService(dataUrl, '/profile/avatar', name).then(function () {
            $timeout(function () {
                $scope.enableSpinner = false;
                $mdDialog.hide();
            }, 1000);
        }, function () {
            $scope.enableSpinner = false;
        })
    }

}]);
/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('AppCtrl', ['$scope', 'socket', '$state', 'authService', '$mdDialog', function ($scope, socket, $state, authService, $mdDialog) {
    $scope.logout = function () {
        authService.logout().success(function () {
            $state.go('login');
        });
    };
    socket.on('authorization_faild', function () {
        $state.go('login');
    });
}]);

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
/**
 * Created by alexeykastyuk on 3/19/16.
 */
app.controller('EmailCtrl', function () {

})
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
/**
 * Created by alexeykastyuk on 3/22/16.
 */
app.controller('ProfileCtrl', ['$scope', 'profileService', '$mdDialog', '$window', 'uploadFileService', function($scope, profileService, $mdDialog, $window, uploadFileService) {

}]);
/**
 * Created by alexeykastyuk on 5/14/16.
 */
app.controller('CalendarCtrl', ['$scope', 'calendarService', 'uiCalendarConfig', '$compile', '$mdDialog', function ($scope, calendarService, uiCalendarConfig, $compile, $mdDialog) {

    $('.fc-today-button').click();

    var view;
    var getData = function () {
        calendarService.getCalendars(moment(view.intervalStart).format('YYYY-MM-DDTHH:mm:ss[Z]'), moment(view.intervalEnd).format('YYYY-MM-DDTHH:mm:ss[Z]')).success(function (result) {
            console.log(result);
            $scope.calendars.google = result.google.calendars.items;
            $scope.calendars.internal = result.inner.calendars;
            $scope.events.splice(0, $scope.events.length - 1);
            result.google.events.forEach(function (e) {
                $scope.events.push(e);
            });
            result.inner.events.forEach(function (e) {
                $scope.events.push(e);
            });

        });
    };

    var createEvent = function (date) {

        $mdDialog.show({
            controller: 'createEventCtrl',
            templateUrl: 'application/modal_dialogs/create_event/create_event.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true,
            locals: {
                calendarData: {

                        internalCalendars: $scope.calendars.internal,
                        googleCalendars: $scope.calendars.google.filter(function (cal) {
                            return cal.accessRole == 'owner';
                        }),
                        start: date

                    }
            }
        })
        .then(function() {
            getData();
        });

    };

    $scope.calendars = {
        google: []
    };
    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.uiConfig = {
        calendar:{
            height: 850,
            header:{
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            viewRender: function (v, element) {
                view = v;
                getData();
            },
            eventRender: function (event, element, view) {
                console.log('Event Render');
                element.attr({'tooltip': event.title,
                             'tooltip-append-to-body': true});
                $compile(element)($scope);
            },
            dayClick: function (date) {
                createEvent(date);
            }
        }
    };

    $scope.createInnerCalendar = function () {
        $mdDialog.show({
            controller: 'createInnerCalendarCtrl',
            templateUrl: 'application/modal_dialogs/create_inner_calendar/create_inner_calendar.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function() {
            getData();
        });
    };

    $scope.createGoogleCalendar = function () {

    }

}]);

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