angular
    .module('scout.controllers')
    .controller('LocationDetailController', LocationDetailController);

function LocationDetailController($scope, $stateParams, $ionicModal, Expedition, Location) {

    $scope.location = Location.get({id: $stateParams.locationId});
    $scope.expedition = Expedition.get($stateParams.expeditionId);
}
