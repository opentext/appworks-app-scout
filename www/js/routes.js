// Copyright 2015-2016 Open Text
//
// Licensed under the Apache License, Version 2.0 (the "License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular
    .module('scout')
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.expeditions', {
                url: '/expeditions',
                params: {filter: ''},
                views: {
                    'tab-expeditions': {
                        templateUrl: 'templates/tab-expeditions.html',
                        controller: 'ExpeditionsController'
                    }
                }
            })
            .state('tab.expedition', {
                url: '/expeditions/:id',
                views: {
                    'tab-expeditions': {
                        templateUrl: 'templates/expeditions/show-expedition.html',
                        controller: 'ExpeditionDetailController'
                    }
                }
            })
            .state('tab.locations', {
                url: '/expeditions/:expeditionId/locations',
                views: {
                    'tab-expeditions': {
                        template: 'not implemented yet'
                    }
                }
            })
            .state('tab.location', {
                url: '/expeditions/:expeditionId/locations/:locationId',
                views: {
                    'tab-expeditions': {
                        templateUrl: 'templates/locations/show-location.html',
                        controller: 'LocationDetailController'
                    }
                }
            })
            .state('tab.assetsForLocation', {
                url: '/expeditions/:expeditionId/locations/:locationId/assets',
                views: {
                    'tab-expeditions': {
                        templateUrl: 'templates/assets/assets.html',
                        controller: 'AssetsController'
                    }
                }
            })


            .state('tab.assets', {
                url: '/assets',
                views: {
                    'tab-assets': {
                        templateUrl: 'templates/tab-assets.html',
                        controller: 'AssetsController'
                    }
                }
            })
            .state('tab.asset', {
                url: '/assets/:id',
                views: {
                    'tab-assets': {
                        templateUrl: 'templates/assets/asset-detail.html',
                        controller: 'AssetDetailController'
                    }
                }
            });


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');
    });
