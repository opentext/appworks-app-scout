(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('$auth', authService);

    function authService() {

        function getCSToken() {
            return '2Eym2HaZbnBqzHq4KSQsV8mmh/OvIon/Qr8RFZPtV9wIGKkzSYiaPL08gYu5di5Z';
        }

        return {
            getCSToken: getCSToken
        };
    }
})();
