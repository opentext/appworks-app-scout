(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Asset', Asset);

    function Asset(Expedition, Location, $q, $http, $auth, $ionicLoading) {

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
                if (parseInt(expeditionId) === parseInt(expedition.objectId)) {
                    angular.forEach(expedition.locations, function (location) {
                        if (parseInt(locationId) === parseInt(location.id)) {
                            location.assets.push(angular.copy(newAsset));
                            console.log('Added a new asset, will now update expedition.json...');
                            Expedition.update(expedition).then(function () {
                                console.info('Expedition update from within asset add successful');
                            }, function () {
                                console.error('Expedition update from within asset add failed');
                            });
                        }
                    });
                }
            });
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

        function upload(folderId, name, dataUrl) {
            var promise = $q.defer(),
                blob,
                req,
                url;

            function onUploadSuccess(res) {
                console.info('Image upload via contentService succeeded', res);
                hideLoading();
                promise.resolve(res);
            }

            function onUploadFail(err) {
                console.error('Image upload via contentService failed', err);
                hideLoading();
                promise.reject(err);
            }

            function onAuthFail(err) {
                hideLoading();
                console.log('couldnt reauth', err);
            }

            function onAuthSuccess() {
                console.log('Uploading image via contentService...');
                blob = dataUrlToBlob(dataUrl);
                req = generateUploadReq(name, blob);
                url = generateUrl(folderId);
                $http.post(url, req.request, req.options).success(onUploadSuccess).error(onUploadFail);
            }

            showLoading();

            $auth.reauth().then(onAuthSuccess, onAuthFail);

            return promise.promise;
        }

        function showLoading() {
            $ionicLoading.show({template: 'Loading...'});
        }

        function hideLoading() {
            $ionicLoading.hide();
        }

        function generateUrl(folderId) {
            return $auth.gatewayUrl() + '/content/v4/nodes/' + folderId + '/children';
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

        function generateUploadReq(name, file) {
            var formData = new FormData();
            formData.append('file', file, name);
            return {
                options: {
                    headers: {
                        'Content-Type': undefined,
                        'otcsticket': $auth.getOTCSTicket()
                    },
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
