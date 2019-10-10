import {h, Component} from "preact";
import tippy from 'tippy.js'


export class ImageItem {

    getHtml(){
        return `<div class="image-container">
                <div class="tools">
                        <div class="pretty p-svg p-curve p-plain">
                        <input type="checkbox" class="check-input"/>
                        <div class="state p-success">
                            <!-- svg path -->
                            <svg class="svg svg-icon" viewBox="0 0 20 20">
                                <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                            </svg>
                            <label></label>
                        </div>
                    </div>
                    
                    <div class="remove-item">
                        <i class="fa fa-trash"></i>
                    </div>
                    <span class="warning" style="display: none"><i class="fa fa-info"></i></span>
                </div>
                <div class="image-item">
               
                    <div id="crop-container-{{=it.uid}}" class='crop-container' data-uid="{{=it.uid}}"
                         style="width:100%; height:100%" data-src="{{=it.url}}" data-zoom="{{=it.zoom}}" data-top="{{=it.top}}" data-left="{{=it.left}}">
                        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                    </div>
                </div>
            </div>`;
    }
}
