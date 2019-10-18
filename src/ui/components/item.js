import {h, Component} from "preact";
import tippy from 'tippy.js'


export class ImageItem {

    getHtml() {
        return `<div class="image-container" id="{{=it.uid}}">
                <div class="tools">
                        <div class="pretty p-svg p-curve p-plain">
                        <input type="checkbox" class="check-input"  {{? it.checked }} checked="checked" {{?}}/>
                        <div class="state p-success">
                            <!-- svg path -->
                            <svg class="svg svg-icon" viewBox="0 0 20 20">
                                <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                            </svg>
                            <label></label>
                        </div>
                    </div>
                       
                     <div class="item-manipulation remove-item tippy" data-tippy-content="Удалить фото">
                        <svg height="12pt" viewBox="-64 0 512 512" width="12pt" xmlns="http://www.w3.org/2000/svg"><path d="m256 80h-32v-48h-64v48h-32v-80h128zm0 0" fill="#62808c"/><path d="m304 512h-224c-26.507812 0-48-21.492188-48-48v-336h320v336c0 26.507812-21.492188 48-48 48zm0 0" fill="#e76e54"/><path d="m384 160h-384v-64c0-17.671875 14.328125-32 32-32h320c17.671875 0 32 14.328125 32 32zm0 0" fill="#77959e"/><path d="m260 260c-6.246094-6.246094-16.375-6.246094-22.625 0l-41.375 41.375-41.375-41.375c-6.25-6.246094-16.378906-6.246094-22.625 0s-6.246094 16.375 0 22.625l41.375 41.375-41.375 41.375c-6.246094 6.25-6.246094 16.378906 0 22.625s16.375 6.246094 22.625 0l41.375-41.375 41.375 41.375c6.25 6.246094 16.378906 6.246094 22.625 0s6.246094-16.375 0-22.625l-41.375-41.375 41.375-41.375c6.246094-6.25 6.246094-16.378906 0-22.625zm0 0" fill="#fff"/></svg>
                    </div>
                    <div class="item-manipulation copy-item tippy" data-tippy-content="Клонировать фото">
                       <img width="14px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAATklEQVRIiWNgGOqAEYn9n4pmwQEThYYSBCxYxLC6hFwwID6AAarEyYD6AAZIjRMUn9PcB6MWjFowagFqTqZqKQoDg6IsoqhUpbkPhj4AABQZBDNxiXEsAAAAAElFTkSuQmCC">
                      </div>
                    <div class="item-manipulation rotate-item tippy" data-tippy-content="Повернуть по часовой стрелке">
                       <svg width="13px" height="15px" viewBox="0 0 16 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="Outlined" transform="translate(-104.000000, -2901.000000)">
                                    <g id="Image" transform="translate(100.000000, 2626.000000)">
                                        <g id="Outlined-/-Image-/-rotate_right" transform="translate(0.000000, 274.000000)">
                                            <g>
                                                <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                                                <path d="M15.55,5.55 L11,1 L11,4.07 C7.06,4.56 4,7.92 4,12 C4,16.08 7.05,19.44 11,19.93 L11,17.91 C8.16,17.43 6,14.97 6,12 C6,9.03 8.16,6.57 11,6.09 L11,10 L15.55,5.55 Z M19.93,11 C19.76,9.61 19.21,8.27 18.31,7.11 L16.89,8.53 C17.43,9.28 17.77,10.13 17.91,11 L19.93,11 Z M13,17.9 L13,19.92 C14.39,19.75 15.74,19.21 16.9,18.31 L15.46,16.87 C14.71,17.41 13.87,17.76 13,17.9 Z M16.89,15.48 L18.31,16.89 C19.21,15.73 19.76,14.39 19.93,13 L17.91,13 C17.77,13.87 17.43,14.72 16.89,15.48 Z" id="🔹-Icon-Color" fill="#358de8"></path>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                    
                   
                    <span class="warning" style="display: none">i</span>
                </div>
                <div class="image-item">
               
                    <div id="crop-container-{{=it.uid}}" class='crop-container {{? it.checked }} enabled {{?}}' data-uid="{{=it.uid}}" data-rotate="{{=it.rotate}}"
                         style="width:100%; height:100%" data-src="{{=it.url}}" data-border="{{=it.border}}" data-zoom="{{=it.zoom}}" data-top="{{=it.top}}" data-left="{{=it.left}}">
                        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                    </div>
                </div>
            </div>`;
    }
}
