angular.module('scout.services', [])

    .factory('StockImage', function () {
        var images = [
            'img/yosemite.jpg',
            'img/new-zealand.jpg',
            'img/bali.jpg',
            'img/iceland.jpg',
            'img/belize.jpg'
        ];

        return {
            all: function () {
                return images;
            },
            random: function () {
                return  images[Math.floor(Math.random() * images.length)];
            }
        }
    })

    .factory('Locations', function ($q) {
        var locations = [
            {
                id: 1,
                expeditionId: 0,
                name: 'New Zealand'
            },
            {
                id:2,
                expeditionId: 0,
                name: 'Bali'
            },
            {
                id: 3,
                expeditionId: 1,
                name: 'Papa New Guinea'
            }
        ];

        return {
            get: function (params) {
                if (angular.isDefined(params.expeditionId)) {
                    return locations.filter(function (location) {
                        return location.expeditionId === params.expeditionId;
                    });
                } else if(angular.isDefined(params.id)) {
                    return locations.filter(function (location) {
                        return location.id === params.id;
                    });
                } else {
                    return locations;
                }
            },
            create: function (newLocation) {
                var promise = $q.defer();
                newLocation.id = Math.ceil(Math.random() * 1000);
                locations.push(newLocation);
                promise.resolve(newLocation);
                return promise.promise;
            }
        }
    })

    .factory('Expeditions', function ($q) {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var expeditions = [{
            id: 0,
            title: 'Ben Sparrow',
            starts: new Date(2013, 9, 22),
            ends: new Date(2013, 9, 25),
            status: 'pending'
        }, {
            id: 1,
            title: 'Max Lynx',
            starts: new Date(2013, 9, 22),
            ends: new Date(2013, 9, 25),
            status: 'submitted'
        }, {
            id: 2,
            title: 'Adam Bradleyson',
            starts: new Date(2013, 9, 22),
            ends: new Date(2013, 9, 25),
            status: 'complete'
        }, {
            id: 3,
            title: 'Perry Governor',
            starts: new Date(2013, 9, 22),
            ends: new Date(2013, 9, 25),
            status: 'rejected'
        }, {
            id: 4,
            title: 'Mike Harrington',
            starts: new Date(2013, 9, 22),
            ends: new Date(2013, 9, 25),
            status: 'pending'
        }];

        return {
            all: function () {
                return expeditions;
            },
            create: function (expedition) {
                var promise = $q.defer();
                expedition.id = Math.ceil(Math.random() * 10000);
                expeditions.push(expedition);
                promise.resolve(expedition);
                return promise.promise;
            },
            recent: function () {
                return expeditions;
            },
            remove: function (expedition) {
                expeditions.splice(expeditions.indexOf(expedition), 1);
            },
            get: function (id) {
                for (var i = 0; i < expeditions.length; i++) {
                    if (expeditions[i].id === parseInt(id)) {
                        return expeditions[i];
                    }
                }
                return null;
            },
            update: function (updated) {
                angular.forEach(expeditions, function (expedition, i) {
                    if (expedition.id === updated.id) {
                        expeditions[i] = angular.copy(updated);
                    }
                });
            },
            complete: function (expedition) {
                var promise = $q.defer();
                expedition.status = 'submitted';
                promise.resolve();
                return promise.promise;
            }
        };
    });
