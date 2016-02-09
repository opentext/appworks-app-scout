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
    .controller('DashCtrl', DashboardController);

function DashboardController($scope, Expedition, StockImage, $ionicModal, $state) {
    $scope.recentExpeditions = Expedition.recent();
    $scope.image = StockImage.random();
    $scope.go = $state.go;

    $scope.newExpedition = {};

    $scope.startNewExpedition = startNewExpedition;
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.reload = reload;
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    function reload() {
        $scope.recentExpeditions = Expedition.recent();
        $scope.$broadcast('scroll.refreshComplete');
    }

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (newExpedition) {
            $scope.newExpedition = {};
            $scope.recentExpeditions.push(newExpedition);
            $state.go('tab.expeditions');
            $scope.modal.hide();
        });
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function closeNewExpeditionModal() {
        $scope.modal.hide();
    }
}
