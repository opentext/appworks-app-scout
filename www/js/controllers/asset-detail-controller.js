angular
    .module('scout.controllers')
    .controller('AssetDetailController', AssetDetailController);

function AssetDetailController($scope, $stateParams, Asset) {
    $scope.asset = Asset.get({id: $stateParams.id});
}
