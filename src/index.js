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
import './lib/cropper.jquery.js'
import 'rangeslider-js/dist/styles.min.css'

window.tippy = require('tippy.js').default;
window.toPixel = require('unit-to-px').default;
window.MM_KOEF = 1; // to convert pixel to millimeter
import Image from './model/Image';
import Options from './model/Options';
import Swal from "sweetalert2";

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

        this.child = createRef();

        this.imageItemTemplate = new ImageItem().getHtml();

        this.options = {
            container: '',
            handlerUrl: '',
            saveOnRefresh: false,
            itemsPerPage: 10,
            immediate: false,
            dest: '',
            maxHeight: 500,
            sizes: null,
            options: [],
            borderWidth: 3,
            defaultOptions: [],
        };

        Object.assign(this.options, options);
        window.defaultBorderWidth = this.options.borderWidth;

        this.state.urls = [];
        this.state.handlerUrl = '';
        //this.state.urls = ls.get('urls') ? ls.get('urls') : [];

        window.onbeforeunload = () => {
            if (this.options.saveOnRefresh) {
                ls.set('urls', this.state.urls);
            }
        };

        this.orderCallback = () => {
        };
        this.startProcessingCallback = () => {
        };
        this.onOptionChangedCallback = () => {
        };


        this.state.sizes = config.sizes;
        if (this.options.sizes) {
            this.state.sizes = this.options.sizes;
        }

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
                                  options={this.options}
                                  sizes={this.state.sizes}
                                  onOrder={(items) => this.orderCallback(items)}
                                  onOptionChanged={(items) => this.onOptionChangedCallback(items)}
                                  onProcessingStart={(result) => this.startProcessingCallback(result)}
                                  urls={this.state.urls}
                                  dest={this.options.dest}
                                  clear={this.clear.bind(this)}
                                  itemsPerPage={this.options.itemsPerPage}
                                  handlerUrl={this.options.handlerUrl}/>, document.getElementById(this.options.container));

        }

    }


    /**
     * Add photos.
     * @param {Image[]} images - Array with photos.
     */
    addPhotos(images) {

        if (images.length > 1000) {
            Swal.fire({
                title: 'Предупреждение',
                text: 'Максимальное допустимое количество фотографи не должно превышать 1000 штук',
                type: 'info'
            });
            images = images.slice(0, 1000);
        }
        images.map((item, key) => {
            setTimeout(() => {

                let photo = {uid: uuid()};
                if (typeof item === 'object') {
                    photo = Object.assign(photo, item);
                } else {
                    photo = Object.assign(photo, {url: item});
                }

                this.state.urls.unshift(photo);
                let html = dot.template(this.imageItemTemplate)({
                    url: photo.thumbnail || photo.url,
                    top: photo.top === 0 ? 0 : photo.top || '',
                    left: photo.left === 0 ? 0 : photo.left || '',
                    zoom: photo.zoom || 0,
                    uid: photo.uid,
                    quantity: photo.quantity || 1,
                    border: photo.border || '',
                    borderThickness: photo.borderThickness || 0,
                    rotate: photo.rotate || '',
                    checked: photo.zoom && (photo.left || photo.top) || photo.original === false || true
                });

                if ($('#main-section').find('.scroll-content').length) {
                    $('#main-section').find('.scroll-content').prepend(html);
                } else {
                    $('#main-section').prepend(html);
                }

                $('#main-section').find(`#crop-container-${photo.uid}`).cropper({
                    createUI: photo.original === false,
                    fitToContainer: !photo.crop || photo.crop === false,
                    onLoad: (uid, width, height, existItem) => {
                        let fitSizes = this.sizesInPixel.filter((item) => item.width <= width && item.height <= height).map((item, index) => item.title);

                        if (fitSizes.length === 0 && !existItem) {
                            let item = $(`#crop-container-${uid}`).closest('.image-container').find('.warning').css('display', 'block');
                            tippy(item.get(0),
                                {
                                    content: document.getElementById('tippy-content-3').innerHTML.replace('current', `${width}x${height}`).replace('min', '567x378'),
                                    theme: 'light'
                                });
                        }
                        if (photo.border) {
                            setTimeout(() => {
                                $(`#${uid}`).find('.border-frame').css('border', `${photo.borderThickness / window.MM_KOEF}px solid ${photo.border}`).css('z-index', '99');
                            }, 500)

                        }
                        $(`#crop-container-${uid}`).attr('data-fit-sizes', fitSizes.join(','));
                    }
                });
               // this.setState({urls: this.state.urls});
                if (images.length === key + 1) {
                    let cropItems = images.filter((item) => item.crop);
                    let borderItems = images.filter((item) => item.border);

                    this.child.current.onPhotoAdded(borderItems[0] ? borderItems[0].border : 'none', cropItems.length > 0, images[0], images[images.length - 1]);
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
        this.startProcessingCallback({status: 'start', count: items.length});
        axios.post(`${this.options.handlerUrl}/processing`, items).then(response => {
           if (callback)
                callback(response.data);
        }).catch(error => {
            if (callback)
                callback(error);
        });
    }

    /**
     * Clear all photos
     */
    clear() {
        this.state.urls.splice(0, this.state.urls.length);
        this.child.current.deleteAllItems(true);
    }

    setPhotoSizes(sizes) {
        this.state.sizes = sizes;
        this.setState(this.state);
        this.child.current.updateSizes(this.state.sizes);

    }

    /**
     * Callback for start images processing.
     * @param {processCallback} callback - Function will triggered when processing images started.
     */
    onProcessingStart(callback) {
        this.startProcessingCallback = callback;
    }


    /**
     * Callback for finish images processing.
     * @param {orderCallback} callback - Function will triggered when Order button click.
     */
    onImagesProcessed(callback) {
        this.orderCallback = callback;
    }

    /**
     * Callback function triggered when option changed
     * @param callback
     */
    onPropertiesChanged(callback){
        this.onOptionChangedCallback = callback;
    }
}

export default Cropper;


/**
 * Make order callback.
 * @callback orderCallback
 * @return {Image[]} List of images
 */

/**
 * Start processing callback.
 * @callback processCallback
 * @return {{status: string, count: number}} Status and count of images
 */
