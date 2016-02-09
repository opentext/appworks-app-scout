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
    .controller('LocationDetailController', LocationDetailController);

function LocationDetailController($scope, $state, $stateParams, Expedition, Location) {
    $scope.location = Location.get({id: $stateParams.locationId});
    $scope.expedition = Expedition.get($stateParams.expeditionId);

    $scope.goBack = goBack;

    $scope.$watch('location.notes', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            Location.update($scope.location);
        }
    });

    function goBack() {
        $state.go('tab.expedition', {id: $stateParams.expeditionId});
    }
}
