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
