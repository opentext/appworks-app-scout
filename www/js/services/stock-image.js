(function () {
    'use strict';

    angular
        .module('scout.services')
        .factory('StockImage', StockImage);

    function StockImage() {
        var images = [
            'img/yosemite.jpg',
            'img/new-zealand.jpg',
            'img/bali.jpg',
            'img/iceland.jpg',
            'img/belize.jpg'
        ];

        return {
            all: function () {
                return images;
            },
            random: function () {
                return images[Math.floor(Math.random() * images.length)];
            }
        }
    }

})();
