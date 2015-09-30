angular
    .module('scout.controllers')
    .controller('LocationDetailController', LocationDetailController);

function LocationDetailController($scope, $stateParams, $ionicModal, Expeditions, Locations) {

    $scope.location = Locations.get({id: $stateParams.locationId});
    $scope.expedition = Expeditions.get($stateParams.expeditionId);
}
