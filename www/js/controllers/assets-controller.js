angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Asset, $stateParams, $ionicModal, Location, $appworks, StockImage, Expedition, $ionicHistory) {
    $scope.StockImage = StockImage;
    $scope.goBack = $ionicHistory.goBack;

    // we are viewing a list of assets for a location, or all of the assets for the app
    loadData();

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
    $scope.reload = loadData;

    function loadData() {
        if ($stateParams.locationId) {
            $scope.expedition = Expedition.get($stateParams.expeditionId);
            $scope.location = Location.get({id: $stateParams.locationId});
            $scope.assets = Asset.get({locationId: $stateParams.locationId});
            $scope.newAsset = {};
        } else {
            $scope.assets = Asset.all();
            $scope.expeditions = Expedition.all();
        }
        $scope.$broadcast('scroll.refreshComplete');
        return true;
    }

    function handleCamera(newAsset) {
        var name = 'photo-' + new Date().getTime() + '.jpg';
        if ($appworks.camera) {
            $appworks.camera.takePicture(function (dataUrl) {
                Asset.upload($scope.expedition.folderId, name, dataUrl).then(function (res) {
                    newAsset.attachments = newAsset.attachments || [];
                    newAsset.attachments.push(res.id);
                    $scope.coverImage = dataUrl;
                });
            });
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
