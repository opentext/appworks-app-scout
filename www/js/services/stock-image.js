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
