(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Expedition', Expedition);

    function Expedition($appworks, $q, $http, Blob) {

        var STORAGE_KEY = 'scoutApp.expeditions',
            CS_STORAGE_FOLDER_ID = 54239,
            CS_STORAGE_KEY = 'scoutApp.backendStorageId',
            STATUS = {pending: 'pending', submitted: 'submitted', completed: 'completed'},
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
                expedition.starts = new Date(expedition.starts);
                expedition.ends = new Date(expedition.ends);
            });
        }

        function all() {
            return expeditions;
        }

        function complete(completedExpedition) {
            var promise = $q.defer();
            angular.forEach(expeditions, function (expedition) {
                if (parseInt(expedition.id) === parseInt(completedExpedition.id)) {
                    expedition.status = STATUS.submitted;
                    promise.resolve();
                }
            });
            save();
            return promise.promise;
        }

        function create(expedition) {
            var promise = $q.defer();
            expedition.id = Math.ceil(Math.random() * 10000);
            expedition.locations = [];
            expedition.status = STATUS.pending;
            expeditions.push(expedition);
            // TODO start workflow via api, store id in CS_STORAGE_FOLDER_ID
            save();
            promise.resolve(expedition);
            return promise.promise;
        }

        function get(id) {
            var list = expeditions.filter(function (expedition) {
                return parseInt(expedition.id) === parseInt(id);
            });
            return list.pop();
        }

        function update(updated) {
            angular.forEach(expeditions, function (expedition, i) {
                if (expedition.id === updated.id) {
                    expeditions[i] = angular.copy(updated);
                }
            });
            save();
        }

        function save() {
            var blob = new Blob([JSON.stringify(expeditions)], {type: "application/json;charset=utf-8"}),
                req = generateUploadReq(blob),
                nodeId = $appworks.cache.getItem(CS_STORAGE_KEY),
                url;

            $appworks.cache.setItem(STORAGE_KEY, expeditions);

            // persist object to content server
            if (nodeId) {
                url = generateUrl(nodeId, 'update');
                $http.post(url, req.request, req.options).success(onUploadSuccess);
            } else {
                url = generateUrl(CS_STORAGE_FOLDER_ID);
                $http.post(url, req.request, req.options).success(onUploadSuccess);
            }
        }

        function generateUrl(nodeId, addVersion) {
            var url = 'http://localhost:8080/content/v4/nodes/' + nodeId;
            if (addVersion) {
                url += '/content';
            } else {
                url += '/children';
            }
            return url;
        }

        function onUploadSuccess(res) {
            console.log(res);
            if (res.id) {
                $appworks.cache.setItem(CS_STORAGE_KEY, res.id);
            }
        }

        function generateUploadReq(file) {
            var formData = new FormData();
            formData.append('cstoken', 'ABeiw8On+SUeqeIY6RfoEtJwDIvtlHkiQofZMa+Y7rwDVitAWnPNueHiAgSwK2rk');
            formData.append('file', file, 'expeditions.json');
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
