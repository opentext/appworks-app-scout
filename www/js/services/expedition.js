(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Expedition', Expedition);

    function Expedition($appworks, $q, $http, Blob, $auth, $rootScope) {

        var STORAGE_KEY = 'scoutApp.expeditions',
            STATUS = {pending: 'PENDING', submitted: 'SUBMITTED', completed: 'COMPLETED', new: 'NEW'},
            self = this,
            retryAttempts = 0;

        // initialize service by loading expeditions from device storage
        init();

        function init() {
            self.expeditions = $appworks.cache.getItem(STORAGE_KEY);

            if (!self.expeditions) {
                self.expeditions = [];
                $appworks.cache.setItem(STORAGE_KEY, self.expeditions);
            }

            convertDatesToDateString();
        }

        function convertDatesToDateString() {
            self.expeditions.map(function (expedition) {
                expedition.starts = new Date.parse(expedition.starts, 'dd-MM-yyyy');
                expedition.ends = new Date.parse(expedition.ends, 'dd-MM-yyyy');
            });
        }

        function all() {
            init();
            return angular.copy(self.expeditions);
        }

        function find(queryObj) {
            angular.forEach(self.expeditions, function (expedition, index) {
                if (parseInt(expedition.id) === parseInt(queryObj.id)) {
                    return index;
                }
            });
            return -1;
        }

        function destroyLocal(expedition) {
            var index = find(expedition);
            return self.expeditions.splice(index, 1);
        }

        function generateCompletionReq(expedition) {
            return {
                workflowId: expedition.workflowId,
                startDate: Date.parse(expedition.starts, 'dd-MM-yyyy').getTime(),
                endDate: Date.parse(expedition.ends, 'dd-MM-yyyy').getTime(),
                status: STATUS.submitted,
                scoutUsername: expedition.scoutUsername,
                scoutUserId: expedition.scoutUserId,
                expensesReportIncluded: expedition.expensesReportIncluded,
                reviewComments: expedition.reviewComments,
                title: expedition.title,
                folderId: expedition.folderId,
                completed: expedition.completed
            };
        }

        function complete(completedExpedition) {
            var promise = $q.defer(),
                url = $auth.gatewayUrl() + '/scoutService/api/expeditions',
                data = generateCompletionReq(completedExpedition),
                config = {headers: {otdsticket: null}};

            if ($appworks.network.online) {
                $auth.reauth().then(function () {
                    config.headers.otdsticket = $auth.getOTDSTicket();
                    // move the expedition along to the next step in the workflow
                    console.log('Attempting to submit expedition via scoutService...');
                    $http.put(url, data, config).then(function (res) {
                        console.info('Submission of expedition via scoutService successful', res.data);
                        // save expedition.json on device and in server
                        update(completedExpedition);
                    }, function (err) {
                        console.error('Submission of expedition via scoutService failed', err);
                        expedition.status = STATUS.new;
                    });

                });
            } else {
                // TODO call this function again when the device comes back online
            }

            return promise.promise;
        }

        function generateWorkflowReq(expedition, authResponse) {
            return {
                title: expedition.title,
                status: expedition.status,
                scoutUsername: authResponse.csUsername,
                scoutUserId: authResponse.csUserId,
                expensesReportIncluded: false,
                startDate: Date.parse(expedition.starts, 'dd-MM-yyyy').getTime(),
                endDate: Date.parse(expedition.ends, 'dd-MM-yyyy').getTime()
            };
        }

        function startExpeditionWorkflow(expedition) {
            var promise = $q.defer();

            if ($appworks.network.online) {
                // get fresh credentials, form the request, and then post to scout service to start the expedition workflow
                $auth.reauth().then(function () {
                    var authResponse = $auth.getAuth(),
                        url = $auth.gatewayUrl() + '/scoutService/api/expeditions',
                        config = {headers: {otdsticket: $auth.getOTDSTicket()}},
                        request = generateWorkflowReq(expedition, authResponse);

                    // send request
                    console.log('Attempting to start expedition workflow via scoutService...');
                    $http.post(url, request, config).then(workflowSuccess, workflowFail);

                    function workflowSuccess(res) {
                        console.info('Succesfully started workflow', res);
                        expedition = angular.merge(expedition, res.data);
                        save();
                        promise.resolve(expedition);
                        retryAttempts = 0;
                    }

                    function workflowFail(err) {
                        console.error('Failed to start workflow');
                        promise.reject(err, expedition);
                    }
                });
            } else {
                // TODO call this function again when the device comes back online
            }

            return promise.promise;
        }

        function uploadInitialExpeditionModel(expedition) {
            console.log('Attempting to create initial expedition.json via content service...');
            createObject(expedition, expedition.folderId).then(function (res) {
                console.info('Upload of initial expedition.json was successful', res.data);
                expedition.objectId = res.data.id;
                expedition.ready = true;
                update(expedition, {local: true});
                $rootScope.$broadcast('expedition.ready', expedition);
            }, function () {
                console.error('Upload of initial expedition.json failed');
                // TODO retry?
            });
        }

        function onStartWorkflowFail(err, expedition) {
            // retry
            if (retryAttempts < 10) {
                startExpeditionWorkflow(expedition);
                retryAttempts += 1;
            }
        }

        function create(expedition) {
            var promise = $q.defer(),
                copiedExpedition;

            // set defaults
            expedition.id = Math.ceil(Math.random() * 100000);
            expedition.locations = [];
            expedition.status = STATUS.new;
            // prevent dupes errors
            copiedExpedition = angular.copy(expedition);
            // update the model
            self.expeditions.push(copiedExpedition);
            save();
            // start a workflow via scout service
            startExpeditionWorkflow(expedition).then(uploadInitialExpeditionModel, onStartWorkflowFail);

            promise.resolve(copiedExpedition);

            return promise.promise;
        }

        function get(id) {
            var list = self.expeditions.filter(function (expedition) {
                return parseInt(expedition.id) === parseInt(id);
            });
            return angular.copy(list.pop());
        }

        function update(updated, options) {
            var promise = $q.defer();

            options = options || {};

            angular.forEach(self.expeditions, function (expedition, i) {
                if (expedition.id === updated.id) {
                    // update the model
                    self.expeditions[i] = angular.copy(updated);
                    // upload expedition.json unless specified in options
                    if (!options.local) {
                        // update expedition.json
                        updateObject(self.expeditions[i], expedition.objectId);
                    }
                    // persist the model
                    save();
                    // send back updated expedition from source
                    promise.resolve(self.expeditions[i]);
                }
            });
            promise.reject('Could not find expedition');
            return promise.promise;
        }

        function save() {
            $appworks.cache.setItem(STORAGE_KEY, self.expeditions);
            console.info('Expedition saved locally');
        }

        function updateObject(obj, objId) {
            return createObject(obj, objId, true);
        }

        function createObject(obj, nodeId, update) {
            var promise = $q.defer(),
                blob = new Blob([JSON.stringify(obj)], {type: "application/json;charset=utf-8"}),
                url = generateUrl(nodeId, update),
                req;

            if ($appworks.network.online) {
                $auth.reauth().then(function () {
                    req = generateUploadReq(blob);
                    console.log('Uploading expedition.json...');
                    $http.post(url, req.request, req.options).then(promise.resolve, promise.reject);
                });
            } else {
                // TODO call this function again when the device comes back online
            }

            return promise.promise;
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
            formData.append('file', file, (name || 'expedition.json'));
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
            complete: complete,
            create: create,
            get: get,
            recent: all,
            update: update,
            save: save,
            destroy: destroyLocal,
            STATUS: STATUS
        }
    }

})();
