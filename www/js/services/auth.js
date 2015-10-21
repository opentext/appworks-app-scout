(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('$auth', authService);

    function authService($appworks, $q) {

        var authObject = {},
            authPromise;

        document.addEventListener('appworksjs.auth', function (data) {
            console.log($appworks.auth);
            console.log(data);
            authObject = data.data.authResponse;
            authPromise.resolve(data.data);
        });

        function reauth() {
            authPromise = $q.defer();
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
