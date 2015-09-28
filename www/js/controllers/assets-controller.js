angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Expeditions) {
    $scope.assets = Expeditions.all();
}
