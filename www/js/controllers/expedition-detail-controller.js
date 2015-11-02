angular
    .module('scout.controllers')
    .controller('ExpeditionDetailController', ExpeditionDetailController);

function ExpeditionDetailController($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, Expedition, Location, $window, $appworks, $csDocument, $ionicHistory, $ionicPopup) {

    // variable bindings
    $scope.expedition = Expedition.get($stateParams.id);
    $scope.newLocation = {};
    $ionicModal.fromTemplateUrl('templates/expeditions/new-location.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.newLocationModal = modal;
    });

    // function bindings
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
    $scope.go = $state.go;

    // update expedition if user changes title or dates
    $scope.$watch('expedition.title', updateExpedition);
    $scope.$watch('expedition.starts', updateExpedition);
    $scope.$watch('expedition.ends', updateExpedition);

    $scope.$on('expedition.ready', function (evt, expedition) {
        $scope.$broadcast('scroll.refreshComplete');
        if ($scope.expedition.id === expedition.id) {
            console.log('expedition is ready', expedition);
            $scope.expedition = expedition;
        }
    });

    // ui/utility

    function closeExpensesModal() {
        $scope.hideExpenseReportActionSheet();
    }

    function closeCompleteExpeditionActionSheet() {
        $scope.hideCompleteExpeditionActionSheet();
    }

    function closeNewLocationModal() {
        $scope.newLocationModal.hide();
    }

    function isEnabled(expedition) {
        return expedition.status === 'NEW' && expedition.ready;
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

    function openNewLocationModal() {
        $scope.newLocationModal.show();
    }


    function reload() {
        if ($scope.expedition.ready) {
            $scope.expedition = Expedition.get($stateParams.id);
            $scope.$broadcast('scroll.refreshComplete');
        } else {
            console.log('retrying create of expedition');
            Expedition.destroy($scope.expedition);
            Expedition.create($scope.expedition).then(function (expedition) {
                console.info('creation of expedition succeeded');
            });
        }
    }

    // expeditions

    function completeExpedition() {
        $scope.hideCompleteExpeditionActionSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Submit expedition?' }
            ],
            titleText: 'Complete Expedition',
            cancelText: 'Cancel',
            cancel: function () {
                closeCompleteExpeditionActionSheet();
            },
            buttonClicked: function () {
                $scope.expedition.status = Expedition.STATUS.submitted;
                Expedition.complete($scope.expedition);
                closeCompleteExpeditionActionSheet();
            }
        });
    }

    function updateExpedition(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            Expedition.update($scope.expedition, {local: true});
        }
    }

    // locations

    function addNewLocation(newLocation) {
        Location.create(newLocation, $scope.expedition).then(function (expedition) {
            $scope.expedition = expedition;
            $scope.newLocation = {};
            closeNewLocationModal();
        });
    }

    function recordCurrentLocation() {
        $appworks.geolocation.getCurrentPosition(function (position) {
            console.log('current position', position);
            $scope.$apply($scope.newLocation.coords = angular.copy(position.coords));
        });
    }

    function removeLocation(location, $index) {
        if ($window.confirm('Delete this location?')) {
            Location.remove(location);
            $scope.expedition.locations.splice($index, 1);
        }
    }

}
