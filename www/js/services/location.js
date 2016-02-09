// Copyright 2015-2016 Open Text
//
// Licensed under the Apache License, Version 2.0 (the "License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Location', Location);

    function Location(Expedition, $q) {

        var self = this;

        self.locations = [];
        self.expeditions = Expedition.all();
        loadLocations();

        function loadLocations() {
            self.locations = [];
            angular.forEach(Expedition.all(), function (expedition) {
                angular.forEach(expedition.locations, function (location) {
                    self.locations.push(location);
                });
            });
        }

        function all() {
            loadLocations();
            return self.locations;
        }

        function create(newLocation, expedition) {
            var promise = $q.defer();
            // set defaults
            newLocation.expeditionId = expedition.id;
            newLocation.id = Math.ceil(Math.random() * 100000);
            newLocation.assets = [];

            expedition.locations.push(newLocation);
            console.log('Adding a location');
            Expedition.update(expedition, {local: true}).then(function () {
                console.info('Location add success');
                loadLocations();
                promise.resolve(angular.copy(expedition));
            });

            return promise.promise;
        }

        function get(params) {
            if (angular.isDefined(params.expeditionId)) {
                return self.locations.filter(function (location) {
                    return parseInt(location.expeditionId) === parseInt(params.expeditionId);
                });
            } else if (angular.isDefined(params.id)) {
                var list = self.locations.filter(function (location) {
                    return parseInt(location.id) === parseInt(params.id);
                });
                return list.pop();
            } else {
                return self.locations;
            }
        }

        function update(updatedLocation) {
            angular.forEach(self.locations, function (location, index) {
                if (parseInt(location.id) === parseInt(updatedLocation.id)) {
                    self.locations[index] = updatedLocation;
                    console.log('Location updated, will now update expedition.json');
                    Expedition.update(Expedition.get(updatedLocation.expeditionId), {local: true}).then(function () {
                        console.info('Expedition update from within location update successful');
                    }, function (err) {
                        console.error('Expedition update from within location update failed', err);
                    });
                }
            });
        }

        function remove(locationToRemove) {
            angular.forEach(Expedition.all(), function (expedition) {
                angular.forEach(expedition.locations, function (location, index) {
                    if (parseInt(location.id) === parseInt(locationToRemove.id)) {
                        console.log('Location being removed from device, will now update expedition.json');
                        expedition.locations.splice(index, 1);
                        Expedition.update(expedition).then(function () {
                            console.info('Expedition update from within location removal successful');
                        }, function () {
                            console.error('Expedition update from within location removal failed');
                        });
                    }
                });
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
