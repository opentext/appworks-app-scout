(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('Expedition', Expedition);

    function Expedition($appworks, $q) {
        var STORAGE_KEY = 'scoutApp.expeditions',
            STATUS = {pending: 'pending', submitted: 'submitted', completed: 'completed'},
            expeditions = $appworks.cache.getItem(STORAGE_KEY);

        if (!expeditions) {
            expeditions = [];
            $appworks.cache.setItem(STORAGE_KEY, expeditions);
        }

        convertDatesToDateString();

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
                    save();
                    promise.resolve();
                }
            });
            return promise.promise;
        }

        function create(expedition) {
            var promise = $q.defer();
            expedition.id = Math.ceil(Math.random() * 10000);
            expedition.locations = [];
            expedition.status = STATUS.pending;
            expeditions.push(expedition);
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
                    save();
                }
            });
        }

        function save() {
            $appworks.cache.setItem(STORAGE_KEY, expeditions);
            // persist object to content server
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
