angular
    .module('scout.controllers')
    .controller('AssetDetailController', AssetDetailController);

function AssetDetailController($scope, $stateParams, Assets) {
    $scope.asset = Assets.get($stateParams.id);
}
