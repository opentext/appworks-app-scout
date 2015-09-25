angular.module('scout.controllers', [])

    .controller('DashCtrl', function ($scope, Expeditions) {
        $scope.recentExpeditions = Expeditions.all();
        $scope.images = [
            'img/yosemite.jpg',
            'img/new-zealand.jpg',
            'img/bali.jpg'
        ];
        $scope.image = $scope.images[Math.floor(Math.random() * $scope.images.length)];
    })

    .controller('ExpeditionsController', function ($scope, Expeditions) {
        $scope.expeditions = Expeditions.all();
        $scope.remove = function ($index) {
            $scope.expeditions.splice($index, 1);
        }
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AssetsController', function ($scope, Expeditions) {
        $scope.assets = Expeditions.all();
    });
