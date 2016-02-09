// Copyright 2015-2016 Open Text
//
// Licensed under the Apache License, Version 2.0 (the "License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular
    .module('scout.controllers')
    .controller('AssetsController', AssetsController);

function AssetsController($scope, Asset, $state, $stateParams, $ionicModal, Location, $appworks, StockImage, Expedition, $ionicActionSheet) {

    // variable bindings
    $scope.StockImage = StockImage;
    loadData();
    $ionicModal.fromTemplateUrl('templates/assets/new-asset.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.newAssetModal = modal;
    });
    $scope.newAsset = {};

    // function bindings
    $scope.openNewAssetModal = openNewAssetModal;
    $scope.closeNewAssetModal = closeNewAssetModal;
    $scope.openPhotoOptionsActionSheet = openPhotoOptionsActionSheet;
    $scope.handleCamera = handleCamera;
    $scope.saveAsset = saveAsset;
    $scope.reload = loadData;
    $scope.goBack = goBack;
    $scope.go = $state.go;

    // ui/utility

    function goBack() {
        $state.go('tab.location', {expeditionId: $stateParams.expeditionId, locationId: $stateParams.locationId});
    }

    function closeNewAssetModal() {
        clearNewAsset();
        $scope.newAssetModal.hide();
    }

    function openNewAssetModal() {
        // refresh the models
        loadData();
        $scope.newAssetModal.show();
    }

    function closePhotoOptionsActionSheet() {
        $scope.hidePhotoOptionsActionSheet();
    }

    function openPhotoOptionsActionSheet() {
        $scope.hidePhotoOptionsActionSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Take a Photo'},
                {text: 'Choose From Library'}
            ],
            titleText: 'Add Photo',
            cancelText: 'Cancel',
            cancel: closePhotoOptionsActionSheet,
            buttonClicked: function (index) {
                handleCamera($scope.newAsset, index);
                closePhotoOptionsActionSheet();
            }
        });
    }

    function loadData() {
        // we are either viewing a list of assets for a location or all of the assets for the app
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
    }

    // new asset

    function clearNewAsset() {
        $scope.newAsset = {};
    }

    function handleCamera(newAsset, chooseFromGallery) {
        var fn;

        if (chooseFromGallery) {
            fn = $appworks.camera.chooseFromLibrary;
        } else {
            fn = $appworks.camera.takePicture;
        }

        fn(function (fileUrl) {
            newAsset.imgSrc = fileUrl;
            newAsset.fileName = 'photo-' + new Date().getTime() + '.jpg';
            newAsset.pendingUpload = true;
            $scope.$apply();
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
            closeNewAssetModal();
            $scope.newAsset = {};
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
}
