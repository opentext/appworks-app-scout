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
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (expedition) {
            $state.go('tab.expeditions', {filter: expedition.id});
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
