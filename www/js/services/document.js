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

(function (angular) {
    'use strict';

    angular
        .module('scout.services')
        .service('$csDocument', documentService);

    function documentService($q, $http, $auth, $appworks, $rootScope) {

        var offlineEvents = {
                get: '$csDocument.getDocument',
                upload: '$csDocument.uploadDocument'
            },
            offlineFns = {
                get: getDocument,
                upload: uploadDocument
            },
            self = this;

        this.get = getDocument;
        this.upload = uploadDocument;

        // events that are fired when the device comes back online
        document.addEventListener(offlineEvents.get, evalFnFromOfflineEvent);
        document.addEventListener(offlineEvents.upload, evalFnFromOfflineEvent);

        function evalFnFromOfflineEvent(evt) {
            var evt = evt.detail.data.detail;
            offlineFns[evt.identifier].apply(self, evt.args);
        }

        function uploadDocument(folderId, filename, saveAsFilename) {
            var promise = $q.defer();

            if ($appworks.network.online) {
                $auth.reauth().then(uploadDocumentOnReauth);
            } else {
                $appworks.offline.defer('upload', arguments, offlineEvents.upload);
            }

            function uploadDocumentOnReauth() {
                var url = $auth.gatewayUrl() + $rootScope.contentServicePath + folderId + '/children',
                    config = {
                        headers: {
                            otcsticket: $auth.getOTCSTicket()
                        }
                    };

                // find the node id for file named => filename
                console.log('Attempting to fetch children of expedition root folder via contentService');
                $http.get(url, config).then(function (res) {
                    console.info('Got children of expedition root folder via contentService', res.data);
                    angular.forEach(res.data.contents, function (item) {
                        if (item.name === filename) {
                            uploadFile(item.id, saveAsFilename, broadcastCompletion, promise.reject);
                        }
                    });
                });
            }

            function broadcastCompletion(model) {
                $rootScope.$broadcast('$csDocument.upload.complete', model);
            }

            return promise.promise;
        }

        function uploadFile(fileId, filename, success, fail) {
            var uploadUrl = $auth.gatewayUrl() +
                    $rootScope.contentServicePath +
                    fileId +
                    '/content?versionNum=1&cstoken=' +
                    $auth.getOTCSTicket(),
                options = new FileUploadOptions();

            options.headers = {'otcsticket': $auth.getOTCSTicket()};
            console.log('Attempting to upload file via contentService...');
            $appworks.storage.uploadFile(filename, uploadUrl, success, fail, options, true);
        }

        function downloadFile(fileId, filename, success, fail) {
            var downloadUrl = $auth.gatewayUrl() +
                    $rootScope.contentServicePath +
                    fileId +
                    '/content?versionNum=1&cstoken=' +
                    $auth.getOTCSTicket(),
                options = new FileUploadOptions();

            options.headers = {'otcsticket': $auth.getOTCSTicket()};
            console.log('Attempting to download file via contentService...');
            $appworks.storage.storeFile(filename, downloadUrl, success, fail, options, true);
        }

        function getDocument(folderId, filename, saveAsFilename) {
            var promise = $q.defer();

            if (folderId && filename && saveAsFilename) {
                if ($appworks.network.online) {
                    $auth.reauth().then(getDocumentOnReauth);
                } else {
                    $appworks.offline.defer('get', arguments, offlineEvents.get);
                }
            } else {
                promise.reject('Did not provide one of: folderId, filename, saveAsFilename');
            }

            function getDocumentOnReauth() {
                var url = $auth.gatewayUrl() + $rootScope.contentServicePath + folderId + '/children',
                    config = {
                        headers: {
                            otcsticket: $auth.getOTCSTicket()
                        }
                    };

                // find the node id for file named => filename
                console.log('Attempting to fetch children of expedition root folder via contentService');
                $http.get(url, config).then(function (res) {
                    console.info('Got children of expedition root folder via contentService', res.data);
                    angular.forEach(res.data.contents, function (item) {
                        if (item.name === filename) {
                            downloadFile(item.id, saveAsFilename, promise.resolve, promise.reject);
                        }
                    });
                });
            }

            return promise.promise;
        }
    }

})(window.angular);
