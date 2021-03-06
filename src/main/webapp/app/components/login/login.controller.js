(function() {
    'use strict';

    angular
        .module('ap10App')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$rootScope', '$state', '$timeout', 'Auth', 'AlertService', '$translate'];

    function LoginController ($rootScope, $state, $timeout, Auth, AlertService, $translate) {
        var vm = this;

        vm.authenticationError = false;
        vm.credentials = {};
        vm.login = login;
        vm.password = null;
        vm.register = register;
        vm.rememberMe = true;
        vm.requestResetPassword = requestResetPassword;
        vm.username = null;

        $timeout(function (){angular.element('#username').focus();});

        function cancel () {
            vm.credentials = {
                username: null,
                password: null,
                rememberMe: true
            };
            vm.authenticationError = false;
        }

        function login (event) {
            event.preventDefault();
            Auth.login({
                username: vm.username,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                if ($state.current.name === 'register' || $state.current.name === 'activate' ||
                    $state.current.name === 'finishReset' || $state.current.name === 'requestReset') {
                    $state.go('home');
                }

                $rootScope.$broadcast('authenticationSuccess');

                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is succesful, go to stored previousState and clear previousState
                if (Auth.getPreviousState()) {
                    var previousState = Auth.getPreviousState();
                    Auth.resetPreviousState();
                    if (previousState.name === 'login') {
                        $state.go('home');
                    } else {
                        $state.go(previousState.name, previousState.params);
                    }
                } else {
                	$state.go('home');
                }
            }).catch(function (response) {
			    if (response && response.status === 403) {
                    $translate('login.messages.error.inactive').then(function (message) {
                        AlertService.error(message);
                    });
                } else {
                    $translate('login.messages.error.authentication').then(function (message) {
                        AlertService.error(message);
                    });
                }
                vm.authenticationError = true;
            });
        }

        function register () {            
            $state.go('register');
        }

        function requestResetPassword () {
            $state.go('requestReset');
        }
    }
})();
