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
            var dataUrl = 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7';
            Asset.upload(dataUrl, name).then(function (res) {
                console.log(res);
            });
            //$appworks.camera.takePicture(function (dataUrl) {
            //    // TODO upload dataUrl to content server
            //    Asset.upload(dataUrl, name).then(function (res) {
            //        console.log(res);
            //    });
            //    asset.imgSrc = dataUrl;
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
