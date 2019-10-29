/**
 * Options model
 * @module Cropper
 * @see Options
 * @name Options
 * @typedef  Options
 * @property {string} container - ID of HTML container for module
 * @property {string} handlerUrl - URL for backend service
 * @property {number} itemsPerPage - Specify number of items per page
 * @property {boolean} immediate - Specify if want to process images after Order button click
 * @property {string} dest - Specify destination path for storing images
 * @property {string} maxHeight - The height of photo container
 * @property {number} borderWidth - Default width for borders
 * @property {Array} options - The list options
 * @property {Array} defaultOptions - The list default options
 */
export default class Options {

    constructor(){
        /**
         * @memberOf Options
         * @property {string} container
         * @type string
         * @name container - ID of HTML container for module
         * @description If this parameter will be missing, module will not show ui. Skip this parameter if you wont just send images fro processing to backend.
         */
        container;

        /**
         * @memberOf Options
         * @property handlerUrl
         * @type string
         * @name handlerUrl - URL for backend service
         * @default none
         */
        handlerUrl;

        /**
         * @memberOf Options
         * @property itemsPerPage
         * @type number
         * @name itemsPerPage - Specify number of items per page
         * @default 10
         */
        itemsPerPage;

        /**
         * @memberOf Options
         * @property immediate
         * @type boolean
         * @name immediate - Specify if want to process images after Order button click
         * @default false
         */
        immediate;

        /**
         * @memberOf Options
         * @property dest
         * @type Array
         * @name dest - Specify destination path for storing images.
         * @description This parameter consist of two elements:<br>
         * 1 - absolute OS path;<br>
         * 2 - second part of path, which will return as image url.<br>
         *     Example: ["var/www/site.com/", "public/images"]
         * @default none
         */
        dest;

        /**
         * @memberOf Options
         * @property maxHeight
         * @type number
         * @name maxHeight - The height of photo container.
         * @default 500
         */
        maxHeight;

        /**
         * @memberOf Options
         * @property options
         * @type Array
         * @name options - The list options.
         */
        options;

        /**
         * @memberOf Options
         * @property defaultOptions
         * @type Array
         * @name defaultOptions - The list default options.
         */
        defaultOptions;
    }

}
