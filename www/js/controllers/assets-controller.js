angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Assets, $stateParams, $ionicModal, Locations) {
    // we are viewing a list of assets for a location, or all of the assets for the app
    if ($stateParams.locationId) {
        $scope.location = Locations.get({id: $stateParams.locationId});
        $scope.assets = Assets.all().filter(function (expedition) {
            return parseInt(expedition.id) === parseInt($stateParams.locationId);
        });
        $scope.newAsset = {};
    } else {
        $scope.assets = Assets.all();
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
        // TODO open camera, save image to device, bind dataUrl to imgSrc property, store the path to retrieve the image from secure storage
    }

    function saveAsset(asset) {
        asset.locationId = $scope.location.id;
        Assets.create(asset).then(function (newAsset) {
            $scope.assets.push(newAsset);
            closeModal();
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
        $scope.modal.show();
    }
}
