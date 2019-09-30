import { h, Component, render } from 'preact';
import {ToolbarComponent} from "./ui/components/toolbar";
import {MainComponent} from "./ui/components/main";
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
const uuid = require('uuid/v4');

const citySelectItems = [
    {label: 'New York', value: 'NY'},
    {label: 'Rome', value: 'RM'},
    {label: 'London', value: 'LDN'},
    {label: 'Istanbul', value: 'IST'},
    {label: 'Paris', value: 'PRS'}
];

export default class Cropper {


    constructor(){
        this.orderCallback = function () {
            $('#cropper-container .image-item > div').each((i, e)=>{
                console.log(e);
                let left = 100* Math.abs(parseFloat($(e).find('img').css('left'))) / parseFloat($(e).find('img').css('width')) | 0;
                let top = 100* Math.abs(parseFloat($(e).find('img').css('top'))) /  parseFloat($(e).find('img').css('height')) | 0;
                let cropX = 100 * (parseFloat($(e).css('width')) + left) / parseFloat($(e).find('img').css('width'));
                let cropY = 100 * (parseFloat($(e).css('height')) + top) / parseFloat($(e).find('img').css('height'));
                console.log({
                    offsetX:left + "%",
                    offsetY:top + "%",
                    cropX:cropX + "%",
                    cropY:cropY + "%",
                });
            })
        };
        let urls = [
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

        render(<MainComponent onOrderClick={()=>this.orderCallback()} urls={urls}/>, document.body);

    }

    tippy(){
        console.log('tippy');
    }

    onOrderClick(callback){
       // this.orderCallback = callback;
    }
}
