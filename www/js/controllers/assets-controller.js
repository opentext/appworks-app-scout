angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Assets, $stateParams) {
    if ($stateParams.locationId) {
        $scope.assets = Assets.all().filter(function (expedition) {
            return parseInt(expedition.id) === parseInt($stateParams.locationId);
        });
    } else {
        $scope.assets = Assets.all();
    }

    $scope.performAddAsset = performAddAsset;

    function performAddAsset() {

    }
}
