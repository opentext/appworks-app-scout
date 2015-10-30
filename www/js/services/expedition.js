(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Expedition', Expedition);

    function Expedition($appworks, $q, $http, Blob, $auth, $ionicLoading) {

        var STORAGE_KEY = 'scoutApp.expeditions',
            STATUS = {pending: 'PENDING', submitted: 'SUBMITTED', completed: 'COMPLETED', new: 'NEW'},
            self = this;

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
            return angular.copy(self.expeditions);
        }

        function complete(completedExpedition) {
            var promise = $q.defer(),
                url = $auth.gatewayUrl() + '/scoutService/api/expeditions',
                config,
                data,
                existingStatus = completedExpedition.status;

            angular.forEach(expeditions, function (expedition) {
                if (parseInt(expedition.id) === parseInt(completedExpedition.id)) {

                    showLoading();

                    $auth.reauth().then(function () {

                        expedition.status = STATUS.submitted;

                        data = {
                            workflowId: expedition.workflowId,
                            startDate: Date.parse(expedition.starts, 'dd-MM-yyyy').getTime(),
                            endDate: Date.parse(expedition.ends, 'dd-MM-yyyy').getTime(),
                            status: expedition.status,
                            scoutUsername: expedition.scoutUsername,
                            scoutUserId: expedition.scoutUserId,
                            expensesReportIncluded: expedition.expensesReportIncluded,
                            reviewComments: expedition.reviewComments,
                            title: expedition.title,
                            folderId: expedition.folderId,
                            completed: expedition.completed
                        };

                        config = {
                            headers: {
                                otdsticket: $auth.getOTDSTicket()
                            }
                        };

                        // move the expedition along to the next step in the workflow
                        console.log('Attempting to submit expedition via scoutService...');
                        $http.put(url, data, config).then(function (res) {
                            console.info('Submission of expedition via scoutService successful', res.data);

                            // save expedition.json on device and in server
                            updateObject(expedition, expedition.id).then(function (res) {
                                hideLoading();
                                save();
                                promise.resolve(res);
                            });

                        }, function (err) {
                            console.error('Submission of expedition via scoutService failed', err);
                            expedition.status = existingStatus;
                            hideLoading();
                        });

                    }, hideLoading);
                }
            });
            return promise.promise;
        }

        function startExpeditionWorkflow(expedition) {
            var promise = $q.defer();

            return promise.promise;
        }

        function onStartWorkflowSuccess() {
            // TODO store values from response in expedition, persist model, upload expedition.json
        }

        function onStartWorkflowFail() {
            // TODO retry
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
            startExpeditionWorkflow(expedition).then(onStartWorkflowSuccess, onStartWorkflowFail);

            promise.resolve(copiedExpedition);

            return promise.promise;
        }

        //function create(expedition) {
        //    var promise = $q.defer(),
        //        url = $auth.gatewayUrl() + '/scoutService/api/expeditions',
        //        request,
        //        config = {
        //            headers: {
        //                otdsticket: $auth.getOTDSTicket()
        //            }
        //        };
        //
        //    showLoading();
        //
        //    // reauthenticate, then start workflow via scout service
        //    $auth.reauth().then(onAuthSuccess, onAuthFail);
        //
        //    function onAuthSuccess() {
        //        var authResponse = $auth.getAuth();
        //
        //        if (!authResponse.csUserId) {
        //            alert('auth response does not contain valid cs credentials');
        //            hideLoading();
        //            return promise.reject();
        //        }
        //
        //        request = {
        //            title: expedition.title,
        //            status: STATUS.new,
        //            scoutUsername: authResponse.csUsername,
        //            scoutUserId: authResponse.csUserId,
        //            expensesReportIncluded: false,
        //            startDate: Date.parse(expedition.starts, 'dd-MM-yyyy').getTime(),
        //            endDate: Date.parse(expedition.ends, 'dd-MM-yyyy').getTime()
        //        };
        //
        //        config.headers.otdsticket = $auth.getOTDSTicket();
        //
        //        function onStartExpeditionWorkflowSuccess(res) {
        //            console.log('Starting expedition workflow via scoutService success: ', res);
        //
        //            // store expedition model from scout service call
        //            res.starts = expedition.starts;
        //            res.ends = expedition.ends;
        //            res.locations = [];
        //            expedition = angular.copy(res);
        //
        //            function onCreateExpeditionObjectSuccess(res) {
        //                console.info('Creating initial expedition.json file via contentService came back with successful response', res);
        //
        //                // store this id as it is essential, the expedition.json file in CS
        //                expedition.objectId = res.id;
        //                expeditions.push(angular.copy(expedition));
        //
        //                // finally, save the expeditions to local storage
        //                $appworks.cache.setItem(STORAGE_KEY, expeditions);
        //
        //                promise.resolve(expedition);
        //                hideLoading();
        //            }
        //
        //            function onCreateExpeditionObjectError(err) {
        //                console.error('Creating initial expedition.json via contentService failed', err);
        //                hideLoading();
        //                // retry
        //                createObject(expedition, res.folderId);
        //            }
        //
        //            // upload the expedition.json file to CS
        //            console.log('Attempting to create initial expedition.json file via contentService...');
        //            createObject(expedition, res.folderId).then(onCreateExpeditionObjectSuccess, onCreateExpeditionObjectError);
        //        }
        //
        //        function onStartExpeditionWorkflowError(err) {
        //            console.error('Starting expedition workflow via scoutService failed', err);
        //            hideLoading();
        //            // retry
        //            create(expedition);
        //        }
        //
        //        console.log('Attempting to start expedition workflow via scoutService...');
        //        $http.post(url, request, config).success(onStartExpeditionWorkflowSuccess).error(onStartExpeditionWorkflowError);
        //    }
        //
        //    function onAuthFail(err) {
        //        console.error('authentication failed. retrying', err);
        //        create(expedition);
        //    }
        //
        //    return promise.promise;
        //}

        function get(id) {
            var list = self.expeditions.filter(function (expedition) {
                return parseInt(expedition.id) === parseInt(id);
            });
            return angular.copy(list.pop());
        }

        function update(updated) {
            var promise = $q.defer();

            angular.forEach(self.expeditions, function (expedition, i) {
                if (expedition.id === updated.id) {
                    // update the model
                    self.expeditions[i] = angular.copy(updated);
                    // persist the model
                    save();
                    // update expedition.json
                    updateObject(self.expeditions[i], expedition.objectId);

                    promise.resolve(self.expeditions[i]);
                }
            });
            promise.reject('Could not find expedition');
            return promise.promise;
        }

        function save(updateBackend) {
            $appworks.cache.setItem(STORAGE_KEY, self.expeditions);

            if (updateBackend) {
                $auth.reauth().then(function () {
                    angular.forEach(self.expeditions, function (expedition) {
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

            //$http.post(url, req.request, req.options).success(deferred.resolve).error(deferred.reject);

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
            STATUS: STATUS
        }
    }

})();
