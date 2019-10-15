import {h, Component, render, createRef} from 'preact';
import {MainComponent} from "./ui/components/main";
import {ImageItem} from "./ui/components/item";
import uuid from 'uuid/v4';
import ls from 'local-storage';
import config from './data.json'
import dot from 'dot'
import axios from "axios";

import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css';
import 'pretty-checkbox/'
//import './lib/cropper.jquery.js'

window.tippy = require('tippy.js').default;
window.toPixel = require('unit-to-px').default;
import Image from './model/Image';
import Options from './model/Options';


/**
 * Cropper module.
 * @module Cropper
 * @see Cropper
 * @name Cropper
 */
 class Cropper extends Component {


    /**
     * Create a cropper.
     * @param {Options} options - The options.
     */
    constructor(options) {
        super();
        //this.child = createRef();
        this.child = createRef();

        this.imageItemTemplate = new ImageItem().getHtml();
        window.onload = function () {
            //console.log(ls.get('urls'));
        };


        this.options = {
            container: '',
            handlerUrl: '',
            saveOnRefresh: false,
            itemsPerPage: 10,
            immediate: false,
            dest: ''
        };

        Object.assign(this.options, options);

        this.state.urls = [];
        this.state.handlerUrl = '';
        this.state.urls = ls.get('urls') ? ls.get('urls') : [];

        window.onbeforeunload = () => {
            if (this.options.saveOnRefresh) {
                ls.set('urls', this.state.urls);
            }
        };

        this.orderCallback = function () {
        };


        this.state.sizes = config.sizes;

        this.sizesInPixel = this.state.sizes.map((item, index) => {
            return {
                title: item.title,
                width: Math.round(item.value[1] * 37.79515625),
                height: Math.round(item.value[0] * 37.79515625)
            }
        });
        if (this.options.container) {
            render(<MainComponent ref={this.child}
                                  immediate={this.options.immediate}
                                  sizes={this.state.sizes} onOrderClick={(items) => this.orderCallback(items)}
                                  urls={this.state.urls}
                                  dest={this.options.dest}
                                  itemsPerPage={this.options.itemsPerPage}
                                  handlerUrl={this.options.handlerUrl}/>, document.getElementById(this.options.container));

        }

    }

    /**
     * Add photos.
     * @param {Image[]} images - Array with photos.
     */
    addPhotos(images) {

        images.map((item, key) => {
            setTimeout(() => {

                let photo = {uid: uuid()};
                if (typeof item === 'object') {
                    photo = Object.assign(photo, item);
                } else {
                    photo = Object.assign(photo, {url: item});
                }
                console.log(photo);
                this.state.urls.unshift(photo);


                let html = dot.template(this.imageItemTemplate)({
                    url: photo.thumbnail || photo.url,
                    top: photo.top || '',
                    left: photo.left || '',
                    zoom: photo.zoom || 0,
                    uid: photo.uid,
                    checked: photo.zoom && (photo.left || photo.top) || null
                });

                if ($('#main-section').find('.scroll-content').length) {
                    $('#main-section').find('.scroll-content').prepend(html);
                } else {
                    $('#main-section').prepend(html);
                }

                $('#main-section').find(`#crop-container-${photo.uid}`).cropper({
                    createUI: false,
                    fitToContainer: !photo.zoom && (!photo.left || !photo.top),
                    onLoad: (uid, width, height) => {
                        let fitSizes = this.sizesInPixel.filter((item) => item.width <= width || item.height <= height).map((item, index) => item.title);

                        if (fitSizes.length === 0) {
                            let item = $(`#crop-container-${uid}`).closest('.image-container').find('.warning').css('display', 'block');
                            tippy(item.get(0),
                                {
                                    content: document.getElementById('tippy-content-3').innerHTML.replace('current', `${width}x${height}`).replace('min', '567x378'),
                                    theme: 'light'
                                });
                        }
                        $(`#crop-container-${uid}`).attr('data-fit-sizes', fitSizes.join(','));
                    }
                });
                this.setState(this.state);
                if (images.length === key + 1) {
                    this.child.current.onPhotoAdded();
                }
            }, 100);
        });
    }

    /**
     * Add photos for immediate processing.
     * @param {Image[]} items - Array with photos.
     * @param {orderCallback} callback - Function will triggered when crop process finished.
     */
    process(items, callback) {
        axios.post(`${this.options.handlerUrl}/processing`, items).then(response => {
            callback(response.data);
        }).catch(error => {
            console.log(error);
            callback(error);
        });
    }

    setPhotoSizes(sizes) {
        this.state.sizes.concat(sizes);
        this.setState(this.state);
    }


    /**
     * Callback for finish images processing.
     * @param {orderCallback} callback - Function will triggered when Order button click.
     */
    onImagesProcessed(callback) {
        this.orderCallback = callback;
    }
}

export default Cropper;


/**
 * Make order callback.
 * @callback orderCallback
 * @return {Image[]} List of images
 */