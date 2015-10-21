(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Expedition', Expedition);

    function Expedition($appworks, $q, $http, Blob, $auth, $ionicLoading) {

        var STORAGE_KEY = 'scoutApp.expeditions',
            STATUS = {pending: 'PENDING', submitted: 'SUBMITTED', completed: 'COMPLETED', new: 'NEW'},
            expeditions;

        // initialize service by loading expeditions from device storage
        init();

        function init() {
            expeditions = $appworks.cache.getItem(STORAGE_KEY);

            if (!expeditions) {
                expeditions = [];
                $appworks.cache.setItem(STORAGE_KEY, expeditions);
            }

            convertDatesToDateString();
        }

        function convertDatesToDateString() {
            expeditions.map(function (expedition) {
                expedition.starts = new Date.parseExact(expedition.starts, 'dd-MM-yyyy');
                expedition.ends = new Date.parseExact(expedition.ends, 'dd-MM-yyyy');
            });
        }

        function all() {
            return angular.copy(expeditions);
        }

        function complete(completedExpedition) {
            var promise = $q.defer();
            angular.forEach(expeditions, function (expedition) {
                if (parseInt(expedition.objectId) === parseInt(completedExpedition.objectId)) {
                    expedition.status = STATUS.submitted;
                    promise.resolve();
                }
            });
            save();
            return promise.promise;
        }

        function showLoading() {
            $ionicLoading.show({template: 'Loading...'});
        }

        function hideLoading() {
            $ionicLoading.hide();
        }

        function create(expedition) {
            var promise = $q.defer(),
                url = $auth.gatewayUrl() + '/scoutService/api/expeditions',
                request,
                config = {
                    headers: {
                        cstoken: $auth.getCSToken()
                    }
                };

            showLoading();

            $auth.reauth().then(function () {

                expedition.locations = [];
                expedition.status = STATUS.new;
                expedition.scoutUsername = $auth.getAuth().csUsername;
                expedition.scoutUserId = $auth.getAuth().csUserId;
                expedition.expensesReportIncluded = false;

                request = {
                    title: expedition.title,
                    status: expedition.status,
                    scoutUsername: expedition.scoutUsername,
                    scoutUserId: expedition.scoutUserId,
                    expensesReportIncluded: false
                };

                config.headers.cstoken = $auth.getCSToken();
                $http.post(url, request, config).success(function (res) {
                    console.log(res);
                    expeditions.push(angular.copy(expedition));
                    promise.resolve(res);
                    hideLoading();
                    save();
                });
            });

            return promise.promise;
        }

        function get(id) {
            var list = expeditions.filter(function (expedition) {
                return parseInt(expedition.objectId) === parseInt(id);
            });
            return angular.copy(list.pop());
        }

        function update(updated) {
            angular.forEach(expeditions, function (expedition, i) {
                if (expedition.objectId === updated.objectId) {
                    expeditions[i] = angular.copy(updated);
                }
            });
            save();
        }

        function save() {

            showLoading();
            convertDatesToDateString();
            // get a fresh CS token, then iterate over the list of expeditions and
            // persist each object in a expedition.json file in the backend
            // if an expedition.json file exists, overwrite the existing one
            // if an expedition.json file does not exist, create one, store the id
            // to reference that json file in content server, and then update the json file once again with this new id attached to the object
            $auth.reauth().then(function () {

                hideLoading();

                angular.forEach(expeditions, function (expedition) {
                    // perform an update or create a new expedition.json file
                    if (expedition.objectId) {
                        // update existing expedition.json file with current object
                        updateObject(expedition, expedition.objectId);
                    } else {
                        createObject(expedition, expedition.folderId).then(function (res) {
                            console.log(res);
                            expedition.objectId = res.id;
                            update(expedition);
                        });
                    }
                });
                $appworks.cache.setItem(STORAGE_KEY, expeditions);
            });
        }

        function updateObject(obj, objId) {
            return createObject(obj, objId, true);
        }

        function createObject(obj, nodeId, update) {
            var deferred = $q.defer(),
                blob = new Blob([JSON.stringify(obj)], {type: "application/json;charset=utf-8"}),
                url = generateUrl(nodeId, update),
                req = generateUploadReq(blob);

            $http.post(url, req.request, req.options).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }

        function generateUrl(nodeId, addVersion) {
            var url = $auth.gatewayUrl() + '/content/v4/nodes/' + nodeId;
            if (addVersion) {
                url += '/content';
            } else {
                url += '/children';
            }
            return url;
        }

        function generateUploadReq(file, name) {
            var formData = new FormData();
            formData.append('cstoken', $auth.getCSToken());
            formData.append('file', file, (name || 'expedition.json'));
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
            complete: complete,
            create: create,
            get: get,
            recent: all,
            update: update,
            save: save,
            STATUS: STATUS
        }
    }

})();
