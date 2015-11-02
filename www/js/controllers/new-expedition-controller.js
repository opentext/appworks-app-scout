angular
    .module('scout.controllers')
    .controller('NewExpeditionController', NewExpeditionController);

function NewExpeditionController($scope, $ionicModal, $state, $rootScope, Expedition) {

    // variable bindings
    $scope.newExpedition = {};
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // function bindings
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.startNewExpedition = startNewExpedition;

    function closeNewExpeditionModal() {
        $scope.modal.hide();
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function startNewExpedition(expedition) {
        Expedition.create(expedition).then(function (newExpedition) {
            $scope.newExpedition = {};
            $scope.modal.hide();
            $rootScope.$broadcast('expeditions.reload');
            $state.go('tab.expedition', {id: newExpedition.id});
        });
    }

}
