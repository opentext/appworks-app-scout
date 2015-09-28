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

    .factory('Expeditions', function ($q) {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var expeditions = [{
            id: 0,
            title: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
        }, {
            id: 1,
            title: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        }, {
            id: 2,
            title: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
        }, {
            id: 3,
            title: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
        }, {
            id: 4,
            title: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
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
            remove: function (chat) {
                expeditions.splice(expeditions.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < expeditions.length; i++) {
                    if (expeditions[i].id === parseInt(chatId)) {
                        return expeditions[i];
                    }
                }
                return null;
            }
        };
    });
