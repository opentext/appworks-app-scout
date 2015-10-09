angular
    .module('scout.controllers')
    .controller('ExpeditionDetailController', ExpeditionDetailController);

function ExpeditionDetailController($scope, $stateParams, $ionicModal, Expedition, Location) {

    $scope.expedition = Expedition.get($stateParams.id);
    console.log($scope.expedition);

    $ionicModal.fromTemplateUrl('templates/expeditions/new-location.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.newLocationModal = modal;
    });

    $scope.newLocation = {};

    $scope.openExpensesModal = openExpensesModal;
    $scope.closeExpensesModal = closeExpensesModal;
    $scope.openNewLocationModal = openNewLocationModal;
    $scope.closeNewLocationModal = closeNewLocationModal;
    $scope.completeExpedition = completeExpedition;
    $scope.recordCurrentLocation = recordCurrentLocation;
    $scope.addNewLocation = addNewLocation;

    // update expedition if user changes title or dates
    $scope.$watch('expedition.title', updateExpedition);
    $scope.$watch('expedition.starts', updateExpedition);
    $scope.$watch('expedition.ends', updateExpedition);

    function updateExpedition(newVal) {
        if (newVal) {
            Expedition.update($scope.expedition);
        }
    }

    function addNewLocation(newLocation) {
        Location.create(newLocation, $scope.expedition.id).then(function (location) {
            $scope.expedition.locations.push(location);
            closeNewLocationModal();
            $scope.newLocation = {};
        });
    }

    function completeExpedition() {
        if (confirm('Are you sure you want to submit this expedition?')) {
            Expedition.complete($scope.expedition);
        }
    }

    function getCurrentLocation() {
        //return $appworks.geolocation.getCurrentPosition(function (coords) {
        //    $scope.newLocation.coords = coords;
        //});
        return {x: 1, y: 1};
    }

    function recordCurrentLocation(newLocation) {
        newLocation.coords = getCurrentLocation();
    }

    function openExpensesModal() {
    }

    function closeExpensesModal() {
    }

    function openNewLocationModal() {
        $scope.newLocationModal.show();
    }

    function closeNewLocationModal() {
        $scope.newLocationModal.hide();
    }
}
