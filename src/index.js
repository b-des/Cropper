import {h, Component, render, createRef} from 'preact';
import {MainComponent} from "./ui/components/main";
import {ImageItem} from "./ui/components/item";
import uuid from 'uuid/v4';
import ls from 'local-storage';
import dot from 'dot'
import axios from "axios";

import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css';
import 'pretty-checkbox/'
import './lib/cropper.jquery.js'
import './ui/styles/customs.css'
import 'rangeslider-js/dist/styles.min.css'

window.tippy = require('tippy.js').default;
window.toPixel = require('unit-to-px').default;
window.MM_KOEF = 1; // to convert pixel to millimeter
import Image from './model/Image';
import Options from './model/Options';
import Swal from "sweetalert2";
import ReactDOM from "preact-compat";

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
        window.photos = [];
        Object.assign(this.options, options);
        window.defaultBorderWidth = this.options.borderWidth;


        this.state = {
            handlerUrl: '',
        };

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
        this.onDeleteAllPhotosCallback = () => {
        };


        this.setState({
            sizes: []
        });

        if (this.options.sizes) {
            this.setState({
                sizes: this.options.sizes
            });
        }
        this.options.options = this.handleOptions(this.options.options);
        if (this.options.container) {
            render(<MainComponent ref={this.child}
                                  immediate={this.options.immediate}
                                  options={this.options}
                                  sizes={this.state.sizes}
                                  onOrder={(items) => this.orderCallback(items)}
                                  onOptionChanged={(items) => this.onOptionChangedCallback(items)}
                                  onProcessingStart={(result) => this.startProcessingCallback(result)}
                                  onDeleteAllPhotos={(result) => this.onDeleteAllPhotosCallback(result)}
                                  urls={this.state.urls}
                                  dest={this.options.dest}
                                  clear={this.clear.bind(this)}
                                  itemsPerPage={this.options.itemsPerPage}
                                  handlerUrl={this.options.handlerUrl}/>, document.getElementById(this.options.container));

        }

    }

    // обновляет массив с опциями
    // подставляя недостающиеся элементы для зависимых опций
    handleOptions(options){
        let allOptionsId = options.map(option => option.option_id);
        options.map(option => {
            option.option_values.map(optionValue => {
                let existedRelatedOptions = optionValue.relation_options.map(relationOption => relationOption.option_id);
                allOptionsId.map(optionId => {
                    if(!existedRelatedOptions.includes(optionId) && +optionId !== +option.option_id){
                        optionValue.relation_options.push({"option_id": `${optionId}`, "option_value_id": []})
                    }
                })
            })
        });

        return options;
    }

    destroy() {
        window.photos = [];
        const root = render(<Cropper/>, document.getElementById(this.options.container));
        ReactDOM.unmountComponentAtNode(document.getElementById(this.options.container));
        render(null, document.getElementById(this.options.container), root);
        // elem.parentNode.removeChild(elem);
        $(`#${this.options.container}`).html('');
    }

    /**
     * Add photos.
     * @param {Image[]} images - Array with photos.
     */
    addPhotos(images) {
        if (images && images.length > 1000) {
            Swal.fire({
                title: 'Предупреждение',
                text: 'Максимальное допустимое количество фотографи не должно превышать 1000 штук',
                type: 'info'
            });
            images = images.slice(0, 1000);
        }
        let html = '';
        images.map((item, key) => {

                let photo = {uid: uuid(), options: {}};
                if (typeof item === 'object') {
                    photo = Object.assign(photo, item);
                } else {
                    photo = Object.assign(photo, {url: item});
                }


                html = dot.template(this.imageItemTemplate)({
                    url: photo.thumbnail || photo.url,
                    top: photo.top === 0 ? 0 : photo.top || '',
                    left: photo.left === 0 ? 0 : photo.left || '',
                    zoom: photo.zoom || 0,
                    uid: photo.uid,
                    quantity: photo.quantity || 1,
                    border: photo.border || '',
                    borderThickness: photo.borderThickness || 0,
                    rotate: photo.rotate || '',
                    checked: photo.zoom && (photo.left || photo.top) || photo.original === false || true,
                    options: this.options.options,
                    selectedOptions: photo.options
                });
                $('.selected-items').html(key + 1);
                $('#main-section').prepend(html);
                window.photos.unshift(photo);

        });

        setTimeout(() => {
            this.child.current.onPhotoAdded();
        }, 1000);
    }

    /**
     * Add photos for immediate processing.
     * @param {Image[]} items - Array with photos.
     * @param {orderCallback} callback - Function will triggered when crop process finished.
     */
    process(items, callback) {
        this.startProcessingCallback({status: 'start', count: items.length});
        /* axios.post(`${this.options.handlerUrl}/processing`, items, {timeout: 600000}).then(response => {
            if (callback)
                 callback(response.data);
         }).catch(error => {
             if (callback)
                 callback(error);
         });*/

        console.log("Send data to render via jQuery AJAX");
        console.log("Quantity of photos: " + items.length);
        axios.post(`${this.options.handlerUrl}/processing`, {data: items}, {timeout: 600000}).then(response => {
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
        //this.state.urls.splice(0, this.state.urls.length);
        window.photos = [];
        this.child.current.deleteAllItems(true);
    }


    componentDidUpdate(previousProps, previousState, previousContext) {
        return super.componentDidUpdate(previousProps, previousState, previousContext);
    }

    /**
     * Callback for start images processing.
     * @param {processCallback} callback - Function will triggered when processing images started.
     */
    onProcessingStart(callback) {
        this.startProcessingCallback = callback;
    }

    onDeleteAllPhotos(callback) {
        this.onDeleteAllPhotosCallback = callback;
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
    onPropertiesChanged(callback) {
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
