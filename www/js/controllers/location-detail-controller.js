angular
    .module('scout.controllers')
    .controller('LocationDetailController', LocationDetailController);

function LocationDetailController($scope, $stateParams, Expedition, Location) {

    $scope.location = Location.get({id: $stateParams.locationId});
    $scope.expedition = Expedition.get($stateParams.expeditionId);

    $scope.$watch('location.notes', function () {
       Location.update($scope.location);
    });
}
