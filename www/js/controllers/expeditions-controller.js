angular
    .module('scout.controllers')
    .controller('ExpeditionsController', ExpeditionsController);

function ExpeditionsController($scope, Expedition, $stateParams) {
    $scope.expeditions = Expedition.all();
    $scope.remove = function ($index) {
        $scope.expeditions.splice($index, 1);
    };

    $scope.filterFn = filter;
    $scope.clearFilter = clearFilter;
    $scope.reload = reload;

    setFilter();

    function reload() {
        $scope.expeditions = Expedition.all();
        $scope.$broadcast('scroll.refreshComplete');
    }

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
            return actual.id === $scope.filter;
        }
        return true;
    }
}
