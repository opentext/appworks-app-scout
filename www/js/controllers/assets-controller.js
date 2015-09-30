angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Expeditions, $stateParams) {
    if ($stateParams.locationId) {
        $scope.assets = Expeditions.all().filter(function (expedition) {
            return parseInt(expedition.id) === parseInt($stateParams.locationId);
        });
    } else {
        $scope.assets = Expeditions.all();
    }

    $scope.performAddAsset = performAddAsset;

    function performAddAsset() {

    }
}
