(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Asset', Asset);

    function Asset(Expedition, Location, $q, $http, $appworks) {

        var assets = [];
        loadAssets();

        function loadAssets() {
            assets = [];
            angular.forEach(Location.all(), function (location) {
                angular.forEach(location.assets, function (asset) {
                    assets.push(asset);
                });
            });
        }

        function all() {
            return assets;
        }

        function create(newAsset, locationId, expeditionId) {
            var promise = $q.defer();

            newAsset.id = Math.ceil(Math.random() * 1000);
            newAsset.locationId = locationId;
            newAsset.expeditionId = expeditionId;
            angular.forEach(Expedition.all(), function (expedition) {
                if (parseInt(expeditionId) === parseInt(expedition.id)) {
                    angular.forEach(expedition.locations, function (location) {
                        if (parseInt(locationId) === parseInt(location.id)) {
                            location.assets.push(angular.copy(newAsset));
                        }
                    });
                }
            });
            Expedition.save();
            loadAssets();
            promise.resolve(angular.copy(newAsset));
            return promise.promise;
        }

        function get(params) {
            // get resource by id, locationId, or list all based on params
            if (angular.isDefined(params.locationId)) {
                return assets.filter(function (asset) {
                    return parseInt(asset.locationId) === parseInt(params.locationId);
                });
            } else if (angular.isDefined(params.id)) {
                var list = assets.filter(function (asset) {
                    console.log(asset);
                    return parseInt(asset.id) === parseInt(params.id);
                });
                return list.pop();
            } else {
                return assets;
            }
        }

        function upload(asset, data) {
        }

        return {
            all: all,
            create: create,
            get: get,
            upload: upload
        }
    }

})();
