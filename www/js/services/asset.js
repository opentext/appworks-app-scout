(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Asset', Asset);

    function Asset(Expedition, Location, $q, $http, $auth, $rootScope) {

        var self = this;

        self.assets = [];
        self.expeditions = Expedition.all();

        $rootScope.$on('Asset.uploadPendingImages', uploadPendingImages);

        loadAssets();

        // api

        function all() {
            loadAssets();
            return self.assets;
        }

        function create(newAsset, locationId, expeditionId) {
            var promise = $q.defer(),
                copiedAsset;

            self.expeditions = Expedition.all();

            newAsset.id = Math.ceil(Math.random() * 100000);
            newAsset.locationId = locationId;
            newAsset.expeditionId = expeditionId;

            copiedAsset = angular.copy(newAsset);

            angular.forEach(self.expeditions, function (expedition, i) {

                if (parseInt(expeditionId) === parseInt(expedition.id)) {

                    angular.forEach(expedition.locations, function (location, j) {

                        if (parseInt(locationId) === parseInt(location.id)) {
                            self.expeditions[i].locations[j].assets.push(copiedAsset);
                            loadAssets();
                            console.log('Added a new asset');
                            Expedition.update(expedition, {local: true});
                            promise.resolve(angular.copy(newAsset));
                        }
                    });
                }
            });

            return promise.promise;
        }

        function get(params) {
            loadAssets();
            // get resource by id, locationId, or list all based on params
            if (angular.isDefined(params.locationId)) {
                return self.assets.filter(function (asset) {
                    return parseInt(asset.locationId) === parseInt(params.locationId);
                });
            } else if (angular.isDefined(params.id)) {
                var list = self.assets.filter(function (asset) {
                    console.log(asset);
                    return parseInt(asset.id) === parseInt(params.id);
                });
                return list.pop();
            } else {
                return self.assets;
            }
        }

        function update(expeditionId, locationId, assetToUpdate, options) {
            self.expeditions = Expedition.all();

            angular.forEach(self.expeditions, function (expedition, i) {
                if (parseInt(expeditionId) === parseInt(expedition.id)) {
                    angular.forEach(expedition.locations, function (location, j) {
                        if (parseInt(locationId) === parseInt(location.id)) {
                            angular.forEach(location.assets, function (asset, k) {
                                if (parseInt(asset.id) === parseInt(assetToUpdate.id)) {
                                    self.expeditions[i].locations[j].assets[k] = assetToUpdate;
                                    Expedition.update(self.expeditions[i], options);
                                }
                            });
                        }
                    });
                }
            });
        }

        function upload(folderId, name, fileUrl) {
            var promise = $q.defer(),
                blob,
                req,
                url,
                dataUrl;

            convertFileUriToDataUri(fileUrl, function (uri) {
                dataUrl = uri;
                $auth.reauth().then(onAuthSuccess, onAuthFail);
            });

            function onUploadSuccess(res) {
                console.info('Image upload via contentService succeeded', res);
                promise.resolve(res);
            }

            function onUploadFail(err) {
                console.error('Image upload via contentService failed', err);
                promise.reject(err);
            }

            function onAuthFail(err) {
                console.log('couldnt reauth', err);
            }

            function onAuthSuccess() {
                console.log('Uploading image via contentService...');
                blob = dataUrlToBlob(dataUrl);
                req = generateUploadReq(name, blob);
                url = generateUrl(folderId);
                $http.post(url, req.request, req.options).success(onUploadSuccess).error(onUploadFail);
            }

            return promise.promise;
        }

        function uploadPendingImages() {
            var promise = $q.defer(),
                pendingAssets = [];

            loadAssets();

            angular.forEach(self.assets, function (asset) {
                if (asset.pendingUpload) {
                    pendingAssets.push(asset);
                }
            });

            if (pendingAssets.length === 0) {
                broadcastCompletion();
            }

            angular.forEach(pendingAssets, function (asset, index) {
                var expedition = Expedition.get(asset.expeditionId);
                console.log('Uploading: ', asset);
                upload(expedition.folderId, asset.fileName, asset.imgSrc).then(function () {
                    asset.pendingUpload = false;
                    update(asset.expeditionId, asset.locationId, asset, {local: true});
                    if (index === pendingAssets.length - 1) {
                        broadcastCompletion();
                        promise.resolve();
                    }
                });
            });

            function broadcastCompletion() {
                console.info('Uploaded all images');
                $rootScope.$broadcast('Asset.uploadPendingImages.complete');
            }

            return promise.promise;
        }

        // helpers

        function loadAssets() {
            self.assets = [];
            angular.forEach(Location.all(), function (location) {
                angular.forEach(location.assets, function (asset) {
                    self.assets.push(asset);
                });
            });
        }

        function convertFileUriToDataUri(fileUrl, successCallback, errorCallback) {
            window.resolveLocalFileSystemURL(fileUrl, gotFileEntry, fail);

            function gotFileEntry(fileEntry) {
                fileEntry.file(gotFile, fail);
            }

            function gotFile(file) {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    if (successCallback) {
                        successCallback(evt.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }

            function fail(err) {
                console.error(err);
            }
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

        function generateUrl(folderId) {
            return $auth.gatewayUrl() + $rootScope.contentServicePath + folderId + '/children';
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
            update: update,
            upload: upload,
            uploadPendingImages: uploadPendingImages
        }
    }

})();
