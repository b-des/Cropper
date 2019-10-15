/**
 * Image model
 * @module Cropper
 * @see Image
 * @name Image
 * @typedef  Image
 * @property {string} url - URL of original size image
 * @property {string} thumbnail - URL of thumbnail
 * @property {Object} size - Size of image in cm
 * @property {Object|boolean} crop - Relative coordinates for cropping image
 * @property {number} rotate - Value for image rotation
 * @property {string} border - Border color: white, black, none
 *
 */
export default class Image {

    constructor(){
        /**
         * @memberOf Image
         * @type string
         * @name url - URL of original size image
         */
        url;

        /**
         * @memberOf Image
         * @type string
         * @name thumbnail - URL of thumbnail
         */
        thumbnail;

        /**
         * @memberOf Image
         * @type Object
         * @name size - Size of image in cm
         * @description Structure: {width:width, height:height}
         */
        size;

        /**
         * @memberOf Image
         * @type {(Object|boolean)}
         * @name crop - Relative coordinates for cropping image
         * @description Structure: {x: left, y: top, w: cropWidth, h: cropHeight}<br> If no need to cropping set false or skip
         */
        crop;

        /**
         * @memberOf Image
         * @type number
         * @name rotate - Value for image rotation
         */
        rotate;

        /**
         * @memberOf Image
         * @type string
         * @name border - Border color: white, black, none
         */
        border;
    }

}