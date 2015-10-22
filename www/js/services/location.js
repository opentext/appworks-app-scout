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
                if (parseInt(expeditionId) === parseInt(expedition.objectId)) {
                    expedition.locations.push(newLocation);
                    Expedition.update(expedition).then(function () {
                        loadLocations();
                        promise.resolve(angular.copy(newLocation));
                    });
                }
            });
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

        function update(updatedLocation) {
            angular.forEach(locations, function (location, index) {
                if (parseInt(location.id) === parseInt(updatedLocation.id)) {
                    locations[index] = updatedLocation;
                    Expedition.update(Expedition.get(updatedLocation.expeditionId));
                }
            });
        }

        function remove(locationToRemove) {
            angular.forEach(Expedition.all(), function (expedition) {
                angular.forEach(expedition.locations, function (location, index) {
                    if (parseInt(location.id) === parseInt(locationToRemove.id)) {
                        console.log(location);
                        expedition.locations.splice(index, 1);
                    }
                });
                Expedition.update(expedition);
            });
        }

        return {
            all: all,
            create: create,
            get: get,
            update: update,
            remove: remove
        }
    }

})();
