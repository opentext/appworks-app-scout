angular
    .module('scout.controllers')
    .controller('ExpeditionsController', ExpeditionsController);

function ExpeditionsController($scope, Expedition, $stateParams, $state, StockImage, $ionicModal) {

    // variable bindings
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.image = StockImage.random();
    $scope.expeditions = Expedition.all();
    $scope.remove = function ($index) {
        $scope.expeditions.splice($index, 1);
    };
    $scope.newExpedition = {};

    // function bindings
    $scope.filterFn = filter;
    $scope.clearFilter = clearFilter;
    $scope.reload = reload;
    $scope.go = $state.go;
    $scope.startNewExpedition = startNewExpedition;
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.reload = reload;

    setFilter();

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (newExpedition) {
            $scope.newExpedition = {};
            $scope.expeditions.push(newExpedition);
            $scope.modal.hide();
        });
    }

    function clearFilter() {
        $scope.filter = null;
        $stateParams.filter = '';
        $scope.filterActive = false;
    }

    function closeNewExpeditionModal() {
        $scope.modal.hide();
    }

    function filter(actual) {
        if ($scope.filterActive) {
            return actual.id === $scope.filter;
        }
        return true;
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function reload() {
        $scope.expeditions = Expedition.all();
        $scope.$broadcast('scroll.refreshComplete');
    }

    function setFilter() {
        if ($stateParams.filter !== '') {
            $scope.filterActive = true;
            $scope.filter = $stateParams.filter;
        }
    }
}
