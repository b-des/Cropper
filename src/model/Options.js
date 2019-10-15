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
    }

}