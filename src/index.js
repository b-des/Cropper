import {h, Component, render} from 'preact';
import {ToolbarComponent} from "./ui/components/toolbar";
import {MainComponent} from "./ui/components/main";
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'pretty-checkbox/'
window.tippy = require('tippy.js').default;
window.toPixel = require('unit-to-px').default;
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
            {title:'10x15', value:[10, 15]},
            {title:'10x30', value:[10, 30]},
            {title:'15x15', value:[15, 15]},
            {title:'15x20', value:[15, 20]},
            {title:'15x22', value:[15, 22]},
            {title:'20x20', value:[20, 20]},
            {title:'20x30', value:[20, 30]},
            {title:'21x30', value:[21, 30]},
            {title:'30x30', value:[30, 30]},
            {title:'30x40', value:[30, 40]},
            {title:'30x45', value:[30, 45]},
            {title:'30x60', value:[30, 60]},
            {title:'30x90', value:[30, 90]},
            {title:'40x40', value:[40, 40]},
            {title:'40x50', value:[40, 50]},
            {title:'40x60', value:[40, 60]},
            {title:'50x50', value:[50, 50]},
            {title:'50x60', value:[50, 60]},
            {title:'50x70', value:[50, 70]},
            {title:'50x75', value:[50, 75]},
            {title:'60x60', value:[60, 60]},
            {title:'60x80', value:[60, 80]},
            {title:'60x90', value:[60, 90]},
            {title:'60x180',value:[60, 180]},
            {title:'70x100',value:[70, 100]},
            {title:'80x80', value:[80, 80]},
           {title:'100x100',value:[100, 100]},
          {title:'100x150', value:[100, 150]}
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
