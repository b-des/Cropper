import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import { h, Component, render } from 'preact';
import {ToolbarComponent} from "./ui/components/toolbar";
import {MainComponent} from "./ui/components/main";
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'

const citySelectItems = [
    {label: 'New York', value: 'NY'},
    {label: 'Rome', value: 'RM'},
    {label: 'London', value: 'LDN'},
    {label: 'Istanbul', value: 'IST'},
    {label: 'Paris', value: 'PRS'}
];

export default class Cropper {


    constructor(){
        this.orderCallback = function () {};
    }

    test(){
        console.log("works!!!");

        render(<MainComponent onOrderClick={()=>this.orderCallback()}/>, document.body);
    }

    onOrderClick(callback){
        this.orderCallback = callback;
    }
}
