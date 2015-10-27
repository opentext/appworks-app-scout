(function (angular) {
    'use strict';

    angular
        .module('scout.services')
        .service('$csDocument', documentService);

    function documentService($q, $http, $auth, $appworks) {

        this.get = getDocument;

        function getDocument(folderId, filename) {
            var promise = $q.defer();

            $auth.reauth().then(function () {
                var url = $auth.gatewayUrl() + '/content/v4/nodes/' + folderId + '/details',
                    config = {
                        headers: {
                            otcsticket: $auth.getOTCSTicket()
                        }
                    };
                // find the node id for file named => filename
                $http.get(url, config).success(function (res) {
                    console.log(res);
                    var fileId = 12345,
                        downloadUrl = $auth.gatewayUrl() + '/content/v4/nodes/' + fileId + '/content';
                    $appworks.storage.storeFile(filename, downloadUrl, promise.resolve, promise.reject);
                });
            });

            return promise.promise;
        }
    }

})(window.angular);
