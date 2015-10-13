angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Asset, $stateParams, $ionicModal, Location, $appworks, StockImage) {
    $scope.StockImage = StockImage;

    // we are viewing a list of assets for a location, or all of the assets for the app
    if ($stateParams.locationId) {
        $scope.location = Location.get({id: $stateParams.locationId});
        $scope.assets = Asset.get({locationId: $stateParams.locationId});
        $scope.newAsset = {};
    } else {
        $scope.assets = Asset.all();
    }

    $ionicModal.fromTemplateUrl('templates/assets/new-asset.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = openModal;
    $scope.closeModal = closeModal;
    $scope.handleCamera = handleCamera;
    $scope.saveAsset = saveAsset;

    function handleCamera(asset) {
        var name = 'photo-' + new Date().getTime() + '.jpg';
        if ($appworks.camera) {
            asset.imgSrc = StockImage.random();
            asset.assetName = name;
            //$appworks.camera.takePicture(function (dataUrl) {
            //    // TODO upload dataUrl to content server
            //    asset.imgSrc = StockImage.random();
            //    asset.assetName = name;
            //});
        }
    }

    function saveAsset(asset) {
        asset.locationId = $scope.location.id;
        Asset.create(asset, $stateParams.locationId, $stateParams.expeditionId).then(function (newAsset) {
            $scope.assets.push(newAsset);
            closeModal();
        });
        $scope.newAsset = {};
    }

    function clearNewAsset() {
        $scope.newAsset = {};
    }

    function closeModal() {
        clearNewAsset();
        $scope.modal.hide();
    }

    function openModal() {
        $scope.modal.show();
    }
}
