angular.module('scout.services', ['angular-appworks']);

//(function () {
//    'use strict';
//
//    var STORAGE_KEYS = {};
//
//    function getResourceFromCache(key, cache) {
//        var resource = cache.getItem(key);
//
//        // key doesnt exist, create it
//        if (!resource) {
//            cache.setItem(key, []);
//            resource = [];
//        }
//        return resource;
//    }
//
//    angular.module('scout.services', ['angular-appworks'])
//
//        .factory('StockImage', function () {
//            var images = [
//                'img/yosemite.jpg',
//                'img/new-zealand.jpg',
//                'img/bali.jpg',
//                'img/iceland.jpg',
//                'img/belize.jpg'
//            ];
//
//            return {
//                all: function () {
//                    return images;
//                },
//                random: function () {
//                    return images[Math.floor(Math.random() * images.length)];
//                }
//            }
//        })
//
//        .factory('Locations', function ($q) {
//            STORAGE_KEYS.locations = 'scoutApp.Locations';
//
//            var locations = [];
//            angular.forEach(Expedition().all(), function (expedition) {
//                angular.forEach(expedition.locations, function (location) {
//                    locations.push(location);
//                });
//            });
//
//            //var locations = [
//            //    {
//            //        id: 1,
//            //        expeditionId: 0,
//            //        name: 'New Zealand',
//            //        coords: {
//            //            latitude: 1,
//            //            longitude: 1,
//            //            altitude: 100,
//            //            heading: 450,
//            //            timestamp: new Date().getTime()
//            //        },
//            //        notes: 'Some generic notes for this location'
//            //    },
//            //    {
//            //        id: 2,
//            //        expeditionId: 0,
//            //        name: 'Bali',
//            //        coords: {
//            //            latitude: 1,
//            //            longitude: 1,
//            //            altitude: 100,
//            //            heading: 450,
//            //            timestamp: new Date().getTime()
//            //        }
//            //    },
//            //    {
//            //        id: 3,
//            //        expeditionId: 1,
//            //        name: 'Papa New Guinea',
//            //        coords: {
//            //            latitude: 1,
//            //            longitude: 1,
//            //            altitude: 100,
//            //            heading: 450,
//            //            timestamp: new Date().getTime()
//            //        }
//            //    }
//            //];
//
//            return {
//                get: function (params) {
//                    if (angular.isDefined(params.expeditionId)) {
//                        return locations.filter(function (location) {
//                            return parseInt(location.expeditionId) === parseInt(params.expeditionId);
//                        });
//                    } else if (angular.isDefined(params.id)) {
//                        var list = locations.filter(function (location) {
//                            return parseInt(location.id) === parseInt(params.id);
//                        });
//                        return list.pop();
//                    } else {
//                        return locations;
//                    }
//                },
//                create: function (newLocation) {
//                    var promise = $q.defer();
//                    newLocation.id = Math.ceil(Math.random() * 1000);
//                    locations.push(newLocation);
//                    promise.resolve(newLocation);
//                    return promise.promise;
//                }
//            }
//        })
//
//        .factory('Assets', function (StockImage, $q, $appworks) {
//            STORAGE_KEYS.assets = 'scoutApp.Assets';
//
//            var assets = getResourceFromCache(STORAGE_KEYS.assets, $appworks.cache);
//
//            //var assets = [{
//            //    id: 0,
//            //    locationId: 0,
//            //    imgSrc: StockImage.random(),
//            //    name: 'My Asset 1'
//            //}, {
//            //    id: 1,
//            //    locationId: 0,
//            //    imgSrc: StockImage.random(),
//            //    name: 'My Asset 2'
//            //}, {
//            //    id: 2,
//            //    locationId: 1,
//            //    imgSrc: StockImage.random(),
//            //    name: 'My Asset 3'
//            //}, {
//            //    id: 3,
//            //    locationId: 2,
//            //    imgSrc: StockImage.random(),
//            //    name: 'My Asset 4'
//            //}, {
//            //    id: 4,
//            //    locationId: 3,
//            //    imgSrc: StockImage.random(),
//            //    name: 'My Asset 5'
//            //}];
//
//            return {
//                all: function () {
//                    return assets;
//                },
//                create: function (newAsset) {
//                    var promise = $q.defer();
//                    newAsset.id = Math.ceil(Math.random() * 1000);
//                    newAsset.imgSrc = StockImage.random();
//                    assets.push(newAsset);
//                    promise.resolve(newAsset);
//                    return promise.promise;
//                },
//                get: function (params) {
//                    if (angular.isDefined(params.locationId)) {
//                        return assets.filter(function (asset) {
//                            return parseInt(asset.locationId) === parseInt(params.locationId);
//                        });
//                    } else if (angular.isDefined(params.id)) {
//                        var list = assets.filter(function (asset) {
//                            return parseInt(asset.id) === parseInt(params.id);
//                        });
//                        return list.pop();
//                    } else {
//                        return assets;
//                    }
//                }
//            }
//        })
//
//        .factory('Expeditions', function ($q, $appworks, Locations, Assets) {
//            STORAGE_KEYS.expeditions = 'scoutApp.Expeditions';
//
//            //var expeditions = getResourceFromCache(STORAGE_KEYS.expeditions, $appworks.cache);
//
//            var expeditions = Expedition
//
//            function all() {
//                return expeditions;
//            }
//
//            function saveAll() {
//                // deep save of all expeditions, all associated locations, and all associated assets
//                angular.forEach(expeditions, function (expedition) {
//                    // collect all locations for this expedition
//                    expedition.locations = Locations.get({expeditionId: expedition.id});
//                    angular.forEach(expedition.locations, function (location) {
//                        // collect all assets for this location
//                        location.assets = Assets.get({locationId: location.id});
//                    });
//                });
//                console.log(expeditions);
//                $appworks.cache.setItem(STORAGE_KEYS.expeditions, expeditions);
//            }
//
//            function save() {
//                console.log(expeditions);
//                // soft save of the expeditions model. does not deep save locations and assets
//                $appworks.cache.setItem(STORAGE_KEYS.expeditions, expeditions);
//            }
//
//            function complete(expedition) {
//                var promise = $q.defer();
//                expedition.status = 'submitted';
//                save();
//                promise.resolve();
//                return promise.promise;
//            }
//
//            function create(expedition) {
//                var promise = $q.defer();
//                expedition.starts = new Date(expedition.starts);
//                expedition.ends = new Date(expedition.ends);
//                expedition.id = Math.ceil(Math.random() * 10000);
//                expedition.locations = [];
//                expeditions.push(expedition);
//                save();
//                promise.resolve(expedition);
//                return promise.promise;
//            }
//
//            function get(id) {
//                var list = expeditions.filter(function (expedition) {
//                    return parseInt(expedition.id) === parseInt(id);
//                });
//                return list.pop();
//            }
//
//            function remove(expedition) {
//                expeditions.splice(expeditions.indexOf(expedition), 1);
//                save();
//            }
//
//            function update(updated) {
//                angular.forEach(expeditions, function (expedition, i) {
//                    if (expedition.id === updated.id) {
//                        expeditions[i] = angular.copy(updated);
//                        save();
//                    }
//                });
//            }
//
//            return {
//                all: all,
//                create: create,
//                recent: all,
//                remove: remove,
//                get: get,
//                update: update,
//                complete: complete,
//                save: save,
//                saveAll: saveAll
//            };
//        });
//})();
//
