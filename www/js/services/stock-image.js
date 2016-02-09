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

(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('StockImage', StockImage);

    function StockImage() {
        var images = [
            'img/iceland.jpg'
        ];

        return {
            all: function () {
                return images;
            },
            random: function () {
                return images[Math.floor(Math.random() * images.length)];
            },
            notes: function () {
                return 'img/notes.png';
            }
        }
    }

})();
