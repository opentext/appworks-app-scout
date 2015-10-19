// define angular-appworks module
angular.module('angular-appworks', []);

// wrapper around global appworks object
angular
    .module('angular-appworks')
    .factory('$appworks', ['$window', appworksService]);

// content server service
angular
    .module('angular-appworks')
    .service('$contentServer', ['$appworks', contentServerService]);
