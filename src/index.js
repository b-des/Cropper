import {h, Component, render} from 'preact';
import {ToolbarComponent} from "./ui/components/toolbar";
import {MainComponent} from "./ui/components/main";
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'pretty-checkbox/'
window.tippy = require('tippy.js').default;
//import './lib/cropper.jquery.js'
const uuid = require('uuid/v4');
const ls = require('local-storage');

export default class Cropper extends Component {


    constructor(options) {
        super();
        window.onload = function () {
            //console.log(ls.get('urls'));
        };

        this.options = {
          saveOnRefresh: false
        };

        Object.assign(this.options, options);

        this.state.urls = [
            {
                uid: uuid(),
                url: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__340.jpg'
            },
            {
                uid: uuid(),
                url: 'https://img.freepik.com/free-vector/abstract-dynamic-pattern-wallpaper-vector_53876-59131.jpg'
            },
            {
                uid: uuid(),
                url: 'https://i.imgur.com/Ywcvr7u.jpg'
            },
        ];
        this.state.urls = ls.get('urls') ? ls.get('urls') : this.state.urls;
        console.log(this.state.urls);

        window.onbeforeunload = () => {
            if(this.options){
                ls.set('urls', this.state.urls);
            }
        };

        this.orderCallback = function () {};


        this.sizes = [
            {
                title: '20x10',
                value: [20, 10]
            },
            {
                title: '10x15',
                value: [10, 15]
            },
            {
                title: '30x30',
                value: [30, 30]
            },
            {
                title: '30x90',
                value: [30, 90]
            },
            {
                title: '40x60',
                value: [40, 60]
            }
        ];

        render(<MainComponent sizes={this.sizes} onOrderClick={(items) => this.orderCallback(items)}
                              urls={this.state.urls}/>, document.body);

    }

    addPhoto(url) {
        this.state.urls.push(url);
        this.setState(this.state);
        console.log(url);
    }

    setPhotoSizes(sizes) {

    }

    onOrderClick(callback) {
         this.orderCallback = callback;
    }
}
