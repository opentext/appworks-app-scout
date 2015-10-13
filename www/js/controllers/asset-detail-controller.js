angular
    .module('scout.controllers')
    .controller('AssetDetailController', AssetDetailController);

function AssetDetailController($scope, $stateParams, Asset, StockImage) {
    $scope.StockImage = StockImage;
    $scope.asset = Asset.get({id: $stateParams.id});
}
