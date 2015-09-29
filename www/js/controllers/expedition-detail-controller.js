angular
    .module('scout.controllers')
    .controller('ExpeditionDetailController', ExpeditionDetailController);

function ExpeditionDetailController($scope, $stateParams, $ionicModal, Expeditions, Locations, $appworks) {

    $scope.expedition = Expeditions.get($stateParams.id);
    $scope.expedition.locations = Locations.get({expeditionId: $scope.expedition.id});

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
            Expeditions.update($scope.expedition);
        }
    }

    function addNewLocation(newLocation) {
        Locations.create(newLocation).then(function (location) {
            $scope.expedition.locations.push(location);
            updateExpedition(true);
            closeNewLocationModal();
            $scope.newLocation = {};
        });
    }

    function completeExpedition() {
        if (confirm('Are you sure you want to submit this expedition?')) {
            Expeditions.complete($scope.expedition);
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
