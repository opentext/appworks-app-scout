angular
    .module('scout.controllers')
    .controller('LocationDetailController', LocationDetailController);

function LocationDetailController($scope, $stateParams, Expedition, Location, $ionicHistory) {
    $scope.location = Location.get({id: $stateParams.locationId});
    $scope.expedition = Expedition.get($stateParams.expeditionId);

    $scope.goBack = $ionicHistory.goBack;

    $scope.$watch('location.notes', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            Location.update($scope.location);
        }
    });
}
