angular
    .module('scout', ['ionic', 'ngFileSaver', 'scout.controllers', 'scout.services']);

angular
    .module('scout')
    .run(onIonicReady);

angular
    .module('scout')
    .run(function ($rootScope) {
        $rootScope.version = '1.1.4';
        $rootScope.contentServicePath = '/content/v5/nodes/';
        $rootScope.scoutServicePath = '/scoutService/api/expeditions';
    });

angular
    .module('scout')
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // implement a notifications handler to process notifications sent to this app by the gateway
            // as an example, use a notification sent to this device to navigate to an expedition by parsing
            // the notification object for the expeditionId, then using $state to go to that expedition
        });
    });

angular
    .module('scout')
    .config(function($compileProvider){
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|assets-library):|data:image\//);
    });

function onIonicReady($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
}
