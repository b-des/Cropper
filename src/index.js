import {h, Component, render, createRef} from 'preact';
import {ToolbarComponent} from "./ui/components/toolbar";
import {MainComponent} from "./ui/components/main";
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'pretty-checkbox/'
import {ImageItem} from "./ui/components/item";

window.tippy = require('tippy.js').default;
window.toPixel = require('unit-to-px').default;
//import './lib/cropper.jquery.js'
const uuid = require('uuid/v4');
const ls = require('local-storage');
import config from './data.json'
import dot from 'dot'


export default class Cropper extends Component {


    constructor(options) {
        super();
        //this.child = createRef();
        this.child = createRef();

        this.imageItemTemplate = new ImageItem().getHtml();
        window.onload = function () {
            //console.log(ls.get('urls'));
        };


        this.options = {
            container: 'cropper',
            handlerUrl: '',
            saveOnRefresh: false,
            itemsPerPage: 20,
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


        this.sizes = config.sizes;

        this.sizesInPixel = this.sizes.map((item, index) => {
            return {
                title: item.title,
                width: Math.round(item.value[1] * 37.79515625),
                height: Math.round(item.value[0] * 37.79515625)
            }
        });

        render(<MainComponent ref={this.child}
                              sizes={this.sizes} onOrderClick={(items) => this.orderCallback(items)}
                              urls={this.state.urls}
                              dest={this.options.dest}
                              itemsPerPage={this.options.itemsPerPage}
                              handlerUrl={this.options.handlerUrl}/>, document.getElementById(this.options.container));

    }


    addPhotos(urls) {

        urls.map((item, key) => {
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
                    top: photo.top,
                    left: photo.left,
                    zoom: photo.zoom || 0,
                    uid: photo.uid
                });

                if ($('#main-section').find('.scroll-content').length) {
                    $('#main-section').find('.scroll-content').prepend(html);
                } else {
                    $('#main-section').prepend(html);
                }

                $('#main-section').find(`#crop-container-${photo.uid}`).cropper({
                    createUI: false,
                    fitToContainer: true,
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
                if (urls.length === key + 1) {
                    this.child.current.onPhotoAdded();
                }
            }, 100);


        });


    }

    setHandlerUrl(handlerUrl) {
        this.state.handlerUrl = handlerUrl;
        this.setState(this.state);
    }

    setPhotoSizes(sizes) {

    }

    setDestinationPath(path) {
        this.path = path;
    }

    onOrderClick(callback) {
        this.orderCallback = callback;
    }
}
