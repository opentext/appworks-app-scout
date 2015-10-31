angular
    .module('scout.controllers')
    .controller('DashCtrl', DashboardController);

function DashboardController($scope, Expedition, StockImage, $ionicModal, $state) {
    $scope.recentExpeditions = Expedition.recent();
    $scope.image = StockImage.random();

    $scope.newExpedition = {};

    $scope.startNewExpedition = startNewExpedition;
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.reload = reload;
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    function reload() {
        $scope.recentExpeditions = Expedition.recent();
        $scope.$broadcast('scroll.refreshComplete');
    }

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (newExpedition) {
            $scope.newExpedition = {};
            $scope.recentExpeditions.push(newExpedition);
            $state.go('tab.expeditions');
            $scope.modal.hide();
        });
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function closeNewExpeditionModal() {
        $scope.modal.hide();
    }
}
