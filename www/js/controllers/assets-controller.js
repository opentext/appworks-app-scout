angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Asset, $state, $stateParams, $ionicModal, Location, $appworks, StockImage, Expedition, $ionicHistory) {

    // we are either viewing a list of assets for a location or all of the assets for the app
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
    $scope.StockImage = StockImage;
    $scope.goBack = $ionicHistory.goBack;
    $scope.go = $state.go;

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
        $appworks.camera.takePicture(function (fileUrl) {
            newAsset.imgSrc = fileUrl;
            newAsset.fileName = 'photo-' + new Date().getTime() + '.jpg';
            newAsset.pendingUpload = true;
            $scope.$apply();
        });
    }

    function uploadAsset(asset) {
        console.log('Uploading image...');

        Asset.upload($scope.expedition.folderId, asset.fileName, asset.imgSrc).then(function () {
            console.info('Image upload succeeded');
            asset.pendingUpload = false;
            Asset.update($scope.expedition.id, $scope.location.id, asset, {local: true});
        });
    }

    function saveAsset(asset) {
        // refresh the models
        loadData();

        // set location id for association
        asset.locationId = $scope.location.id;

        if (asset.pendingUpload) {
            uploadAsset(asset);
        }

        Asset.create(asset, $stateParams.locationId, $stateParams.expeditionId).then(function () {
            loadData();
            closeModal();
            $scope.newAsset = {};
        });
    }

    function clearNewAsset() {
        $scope.newAsset = {};
    }

    function closeModal() {
        clearNewAsset();
        $scope.modal.hide();
    }

    function openModal() {
        // refresh the models
        loadData();
        $scope.modal.show();
    }
}
