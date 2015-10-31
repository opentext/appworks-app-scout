angular
    .module('scout.controllers')
    .controller('ExpeditionDetailController', ExpeditionDetailController);

function ExpeditionDetailController($scope, $stateParams, $ionicModal, $ionicActionSheet, Expedition, Location, $window, $appworks, $csDocument, $ionicHistory, $ionicPopup) {

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
    $scope.goBack = $ionicHistory.goBack;
    $scope.isEnabled = isEnabled;
    $scope.reload = reload;

    // update expedition if user changes title or dates
    $scope.$watch('expedition.title', updateExpedition);
    $scope.$watch('expedition.starts', updateExpedition);
    $scope.$watch('expedition.ends', updateExpedition);

    $scope.$on('expedition.ready', function (evt, expedition) {
        console.log('expedition is ready', expedition);
        $scope.$broadcast('scroll.refreshComplete');
        if ($scope.expedition.id === expedition.id) {
            $scope.expedition = expedition;
        }
    });

    function reload() {
        if ($scope.expedition.ready) {
            console.log('updating expedition and uploading expedition.json');
            Expedition.update($scope.expedition).then(function (expedition) {
                console.info('update of expedition succeeded');
                $scope.expedition = expedition;
                $scope.$broadcast('scroll.refreshComplete');
            });
        } else {
            console.log('retrying create of expedition');
            Expedition.destroy($scope.expedition);
            Expedition.create($scope.expedition).then(function (expedition) {
                console.info('creation of expedition succeeded');
            });
        }
    }

    function isEnabled(expedition) {
        return expedition.status === 'NEW' && expedition.ready;
    }

    function updateExpedition(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            Expedition.update($scope.expedition);
        }
    }

    function addNewLocation(newLocation) {
        Location.create(newLocation, $scope.expedition.id).then(function (newLocation) {
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
        $ionicPopup.confirm({
            title: 'Submit expedition',
            template: 'Are you sure you want to submit this expedition?'
        }).then(function(res) {
            if(res) {
                $scope.expedition.status = Expedition.STATUS.submitted;
                Expedition.complete($scope.expedition);
            }
        });
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
        $scope.hideExpenseReportActionSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Download Expense Report?' }
            ],
            titleText: 'Open Expense Report',
            cancelText: 'Cancel',
            cancel: function () {
                closeExpensesModal();
            },
            buttonClicked: function () {
                console.log('downloading expense report spreadsheet...');
                $csDocument.get($scope.expedition.folderId, 'expense-tracking.xlsx').then(function (res) {
                    console.log('download of expense report succeeded', res);
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Download succeeded.'
                    });
                });
                closeExpensesModal();
            }
        });
    }

    function closeExpensesModal() {
        $scope.hideExpenseReportActionSheet();
    }

    function openNewLocationModal() {
        $scope.newLocationModal.show();
    }

    function closeNewLocationModal() {
        $scope.newLocationModal.hide();
    }
}
