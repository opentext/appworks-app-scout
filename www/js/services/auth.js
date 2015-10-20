(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('$auth', authService);

    function authService($appworks, $q) {

        var authObject = {},
            authPromise;

        document.addEventListener('appworksjs.auth', function (data) {
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

        return {
            getCSToken: getCSToken,
            reauth: reauth
        };
    }
})();
