angular
    .module('scout.controllers')
    .controller('ExpeditionsController', ExpeditionsController);

function ExpeditionsController($scope, Expedition, $state, StockImage) {

    // variable bindings
    $scope.expeditions = Expedition.all();
    $scope.image = StockImage.random();
    $scope.remove = function ($index) {
        $scope.expeditions.splice($index, 1);
    };

    // function bindings
    $scope.reload = reload;
    $scope.go = $state.go;
    $scope.reload = reload;

    // listen for broadcast events
    $scope.$on('expeditions.reload', reload);

    function reload() {
        $scope.expeditions = Expedition.all();
        $scope.$broadcast('scroll.refreshComplete');
    }

}
