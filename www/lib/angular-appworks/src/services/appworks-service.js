function appworksService($window) {
    if ($window.appworks) {
        var $appworks = $window.appworks;
        delete($window.appworks);
        return $appworks;
    }
    return {

    };
}