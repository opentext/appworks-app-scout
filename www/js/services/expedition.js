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
                    showLoading();
                    updateObject(expedition, expedition.objectId).then(function (res) {
                        hideLoading();
                        save();
                        promise.resolve(res);
                    });
                }
            });
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

            // reauthenticate, then start workflow via scout service
            $auth.reauth().then(onAuthSuccess, onAuthFail);

            function onAuthSuccess() {
                request = {
                    title: expedition.title,
                    status: STATUS.new,
                    scoutUsername: $auth.getAuth().csUsername,
                    scoutUserId: $auth.getAuth().csUserId,
                    expensesReportIncluded: false
                };

                config.headers.cstoken = $auth.getCSToken();

                function onStartExpeditionWorkflowSuccess(res) {
                    console.log('starting expedition workflow succeeded: ', res);

                    // store expedition model from scout service call
                    res.starts = expedition.starts;
                    res.ends = expedition.ends;
                    res.locations = [];
                    expedition = angular.copy(res);

                    function onCreateExpeditionObjectSuccess(res) {
                        console.log('tried to create expedition.json', res);

                        // store this id as it is essential, the expedition.json file in CS
                        expedition.objectId = res.id;
                        expeditions.push(angular.copy(expedition));

                        // finally, save the expeditions to local storage
                        $appworks.cache.setItem(STORAGE_KEY, expeditions);

                        promise.resolve(expedition);
                        hideLoading();
                    }

                    function onCreateExpeditionObjectError(err) {
                        console.log(err);
                        hideLoading();
                        // retry
                        createObject(expedition, res.folderId);
                    }

                    // upload the expedition.json file to CS
                    createObject(expedition, res.folderId).then(onCreateExpeditionObjectSuccess, onCreateExpeditionObjectError);
                }

                function onStartExpeditionWorkflowError(err) {
                    console.log('starting expedition workflow failed', err);
                    hideLoading();
                    // retry
                    create(expedition);
                }

                $http.post(url, request, config).success(onStartExpeditionWorkflowSuccess).error(onStartExpeditionWorkflowError);
            }

            function onAuthFail(err) {
                console.log('authentication failed. retrying', err);
                create(expedition);
            }

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
                    // update the model
                    expeditions[i] = angular.copy(updated);
                    // persist the model's json file in CS
                    showLoading();
                    updateObject(expeditions[i], expedition.objectId).then(function (res) {
                        console.log('expedition updated', res);
                        hideLoading();
                        // save the model in local storage
                        save();
                    }, function (err) {
                        console.log('update failed. retrying', err);
                        // failed, retry
                        update(updated);
                    });
                }
            });
        }

        function save(updateBackend) {
            $appworks.cache.setItem(STORAGE_KEY, expeditions);

            if (updateBackend) {
                $auth.reauth().then(function () {
                    angular.forEach(expeditions, function (expedition) {
                        createObject(expedition, expedition.objectId, true);
                    });
                });
            }
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
