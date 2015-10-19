(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Asset', Asset);

    function Asset(Expedition, Location, $q, $http, $auth) {

        var assets = [],
            CS_STORAGE_FOLDER_ID = 54873;
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

        function upload(dataUrl, name) {
            var blob = dataUrlToBlob(dataUrl),
                req = generateUploadReq(blob, name),
                url = generateUrl();
            return $http.post(url, req.request, req.options);
        }

        function generateUrl() {
            return 'http://localhost:8080/content/v4/nodes/' + CS_STORAGE_FOLDER_ID + '/children';
        }

        function dataUrlToBlob(dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = decodeURIComponent(parts[1]);

                return new Blob([raw], {type: contentType});
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], {type: contentType});
        }

        function generateUploadReq(file, name) {
            var formData = new FormData();
            formData.append('cstoken', $auth.getCSToken());
            formData.append('file', file, name);
            return {
                options: {
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                },
                request: formData
            };
        }

        return {
            all: all,
            create: create,
            get: get,
            upload: upload
        }
    }

})();
