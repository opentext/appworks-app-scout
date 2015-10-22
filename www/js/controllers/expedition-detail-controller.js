angular
    .module('scout.controllers')
    .controller('ExpeditionDetailController', ExpeditionDetailController);

function ExpeditionDetailController($scope, $stateParams, $ionicModal, Expedition, Location, $window, $appworks) {

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
    $scope.removeLocation = removeLocation;

    // update expedition if user changes title or dates
    $scope.$watch('expedition.title', updateExpedition);
    $scope.$watch('expedition.starts', updateExpedition);
    $scope.$watch('expedition.ends', updateExpedition);

    function updateExpedition(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            Expedition.update($scope.expedition);
        }
    }

    function addNewLocation(newLocation) {
        Location.create(newLocation, $scope.expedition.objectId).then(function (newLocation) {
            closeNewLocationModal();
            $scope.expedition.locations.push(newLocation);
            $scope.newLocation = {};
        });
    }

    function removeLocation(location, $index) {
        if ($window.confirm('Delete this location?')) {
            Location.remove(location);
            $scope.expedition.locations.splice($index, 1);
        }
    }

    function completeExpedition() {
        if (confirm('Are you sure you want to submit this expedition?')) {
            Expedition.complete($scope.expedition);
            $scope.expedition.status = Expedition.STATUS.submitted;
        }
    }

    function getCurrentLocation() {
        return $appworks.geolocation.getCurrentPosition(function (position) {
            console.log('current position', position);
            $scope.$apply($scope.newLocation.coords = angular.copy(position.coords));
        });
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
