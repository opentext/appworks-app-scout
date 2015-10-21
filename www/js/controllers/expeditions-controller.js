angular
    .module('scout.controllers')
    .controller('ExpeditionsController', ExpeditionsController);

function ExpeditionsController($scope, Expedition, $stateParams, $state) {
    $scope.expeditions = Expedition.all();
    $scope.remove = function ($index) {
        $scope.expeditions.splice($index, 1);
    };

    $scope.filterFn = filter;
    $scope.clearFilter = clearFilter;

    setFilter();

    function setFilter() {
        if ($stateParams.filter !== '') {
            $scope.filterActive = true;
            $scope.filter = $stateParams.filter;
        }
    }

    function clearFilter() {
        $scope.filter = null;
        $stateParams.filter = '';
        $scope.filterActive = false;
    }

    function filter(actual) {
        if ($scope.filterActive) {
            return actual.objectId === $scope.filter;
        }
        return true;
    }
}
