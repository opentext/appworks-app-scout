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
    .controller('NewExpeditionController', NewExpeditionController);

function NewExpeditionController($scope, $ionicModal, $state, $rootScope, Expedition) {

    // variable bindings
    $scope.newExpedition = {};
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // function bindings
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.startNewExpedition = startNewExpedition;

    function closeNewExpeditionModal() {
        $scope.modal.hide();
        $scope.newExpedition = {};
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (newExpedition) {
            $scope.newExpedition = {};
            $scope.modal.hide();
            $rootScope.$broadcast('expeditions.reload');
            $state.go('tab.expedition', {id: newExpedition.id});
        });
    }

}
