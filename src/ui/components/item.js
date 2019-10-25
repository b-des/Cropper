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
                    <div class="item-manipulation border-adjust tippy" data-tippy-content="Управление рамкой">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" style=" fill:#000000;"><path fill="#E57373" d="M42.583,9.067l-3.651-3.65c-0.555-0.556-1.459-0.556-2.015,0l-1.718,1.72l5.664,5.664l1.72-1.718C43.139,10.526,43.139,9.625,42.583,9.067"></path><path fill="#FF9800" d="M4.465 21.524H40.471999999999994V29.535H4.465z" transform="rotate(134.999 22.469 25.53)"></path><path fill="#B0BEC5" d="M34.61 7.379H38.616V15.392H34.61z" transform="rotate(-45.02 36.61 11.385)"></path><path fill="#FFC107" d="M6.905 35.43L5 43 12.571 41.094z"></path><path fill="#37474F" d="M5.965 39.172L5 43 8.827 42.035z"></path></svg>
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
                    <span class="item-manipulation warning" style="display: none; background: #ffdd23">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 24 24" style=" fill:#000000;">    <path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"></path></svg>
                    </span>
                </div>
                <div class="image-item">
               
                    <div id="crop-container-{{=it.uid}}" class='crop-container {{? it.checked }} enabled {{?}}' data-uid="{{=it.uid}}" data-rotate="{{=it.rotate}}"
                         style="width:100%; height:100%; padding: {{=it.borderThickness/3.75}}px;" data-src="{{=it.url}}" data-border="{{=it.border}}" data-zoom="{{=it.zoom}}" data-top="{{=it.top}}" data-left="{{=it.left}}"
                         data-border-thickness="{{=it.borderThickness}}" >
                        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                    </div>
                </div>
            </div>`;
    }
}
