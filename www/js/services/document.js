(function (angular) {
    'use strict';

    angular
        .module('scout.services')
        .service('$csDocument', documentService);

    function documentService($q, $http, $auth, $appworks, $ionicLoading) {

        this.get = getDocument;

        function showLoading() {
            $ionicLoading.show({template: 'Loading...'});
        }

        function hideLoading() {
            $ionicLoading.hide();
        }

        function downloadFile(fileId, filename, success, fail) {
            var downloadUrl = $auth.gatewayUrl() + '/content/v4/nodes/' + fileId + '/content?versionNum=1&cstoken=' + $auth.getOTCSTicket(),
                options = new FileUploadOptions();

            options.headers = {'otcsticket': $auth.getOTCSTicket()};
            $appworks.storage.storeFile(filename, downloadUrl, success, fail, options);
        }

        function getDocument(folderId, filename) {

            var promise = $q.defer();

            showLoading();

            $auth.reauth().then(function () {
                var url = $auth.gatewayUrl() + '/content/v4/nodes/' + folderId + '/children',
                    config = {
                        headers: {
                            otcsticket: $auth.getOTCSTicket()
                        }
                    };
                // find the node id for file named => filename
                $http.get(url, config).then(function (res) {
                    console.log(res.data);
                    angular.forEach(res.data.contents, function (item) {
                        if (item.name === filename) {
                            downloadFile(item.id, filename, promise.resolve, promise.reject);
                            hideLoading();
                        }
                    });
                }, hideLoading);
            }, hideLoading);

            return promise.promise;
        }
    }

})(window.angular);
