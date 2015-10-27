(function (angular) {
    'use strict';

    angular
        .module('scout.services')
        .service('$document', documentService);

    function documentService($q, $http, $auth) {

        this.get = getDocument;

        function getDocument(folderId, filename) {
            var promise = $q.defer();

            //$auth.reauth().then(function () {
            //    var url = $auth.gatewayUrl() + '/content/v4/nodes/' + folderId + '/details';
            //    // find the node id for file named => filename
            //    $http.get().success(function (res) {
            //        console.log(res);
            //    });
            //});

            return promise.promise;
        }
    }

})(window.angular);
