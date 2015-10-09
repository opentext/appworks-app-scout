(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Location', Location);

    function Location(Expedition, $q) {

        var locations = [];
        loadLocations();

        function loadLocations() {
            locations = [];
            angular.forEach(Expedition.all(), function (expedition) {
                angular.forEach(expedition.locations, function (location) {
                    locations.push(location);
                });
            });
        }

        function all() {
            return locations;
        }

        function create(newLocation, expeditionId) {
            var promise = $q.defer();
            newLocation.expeditionId = expeditionId;
            newLocation.id = Math.ceil(Math.random() * 1000);
            newLocation.assets = [];
            angular.forEach(Expedition.all(), function (expedition) {
                if (parseInt(expeditionId) === parseInt(expedition.id)) {
                    expedition.locations.push(newLocation);
                }
            });
            Expedition.save();
            loadLocations();
            promise.resolve(newLocation);
            return promise.promise;
        }

        function get(params) {
            if (angular.isDefined(params.expeditionId)) {
                return locations.filter(function (location) {
                    return parseInt(location.expeditionId) === parseInt(params.expeditionId);
                });
            } else if (angular.isDefined(params.id)) {
                var list = locations.filter(function (location) {
                    return parseInt(location.id) === parseInt(params.id);
                });
                return list.pop();
            } else {
                return locations;
            }
        }

        return {
            all: all,
            create: create,
            get: get
        }
    }

})();
