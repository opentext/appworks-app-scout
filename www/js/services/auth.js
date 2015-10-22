(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('$auth', authService);

    function authService($appworks, $q) {

        var authObject = {},
            authPromise;

        function onReauth(data) {
            console.log(data);
            authObject = data.data.authResponse;
            authPromise.resolve(data.data);
            document.removeEventListener('appworksjs.auth', onReauth);
        }

        function reauth() {
            authPromise = $q.defer();
            document.addEventListener('appworksjs.auth', onReauth);
            $appworks.auth.authenticate();
            return authPromise.promise;
        }

        function getCSToken() {
            console.log(authObject.cstoken);
            return authObject.cstoken;
        }

        function getGatewayUrl() {
            return window.gatewayUrl;
        }

        function getAuth() {
            return authObject;
        }

        return {
            getCSToken: getCSToken,
            reauth: reauth,
            gatewayUrl: getGatewayUrl,
            getAuth: getAuth
        };
    }
})();
