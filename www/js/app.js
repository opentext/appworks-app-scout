angular
    .module('scout', ['ionic', 'scout.controllers', 'scout.services']);

angular
    .module('scout')
    .run(onIonicReady);

angular
    .module('scout')
    .run(connectToContentService);

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

function connectToContentService($http, $appworks) {
    var requestData = {
        method: 'GET',
        url:  getBaseUrl() + '/content/v4/properties/',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        params: {cstoken: getCSToken()}
    };

    function getCSToken() {
        if ($appworks.auth) {
            return $appworks.auth.authResponse.cstoken;
        }
    }

    function getBaseUrl() {
        if ($appworks.auth) {
            return $appworks.auth.gatewayUrl;
        }
        return 'http://localhost:8080';
    }

    $http(requestData).then(function (data) {
        alert(JSON.stringify(data));
    }, function (err) {
        alert(JSON.stringify(err));
    });
}
