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
            document.removeEventListener(evt.eventListener, offlineFns[evt.eventListener]);
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
                            uploadFile(item.id, saveAsFilename, promise.resolve, promise.reject);
                        }
                    });
                });
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

            if ($appworks.network.online) {
                $auth.reauth().then(getDocumentOnReauth);
            } else {
                $appworks.offline.defer('get', arguments, offlineEvents.get);
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
