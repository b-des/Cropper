import {h, Component} from "preact";

const AColorPicker = require('a-color-picker');
import rangesliderJs from 'rangeslider-js'

export class BorderComponent {
    constructor() {
        this.color = '';
        this.isInititalized = false;
        this.isOpen = false;
        this.charge = null;
        this.newThickness = 0;
    }

    isInitialized() {
        return this.isInititalized;
    }

    show(charge) {
        if (this.isOpen) {
            this.onModalClose();
        }
        $("#border-popup").show();
        this.charge = charge;
        $('div#color-picker').html('');


        AColorPicker.from('div#color-picker').on('change', (picker, color) => {
            let thickness = this.newThickness / window.MM_KOEF;
            this.color = AColorPicker.parseColor(color, "hex");
            $(`#crop-container-${this.charge}`).find(".border-frame").css('border', `${thickness}px solid ${this.color}`);
        });

        let thickness = +$(`#crop-container-${this.charge}`).attr('data-border-thickness') || 1;
        this.newThickness = thickness;
        rangesliderJs.create(document.getElementById('border-thickness-slider'), {
            min: 1,
            max: 50,
            value: thickness,
            step: 1,
            onSlide: (value, percent, position) => {
                this.changeThickness(value);
                this.newThickness = value;
                $('#border-thickness-label span').text(value);
            },
        });
        document.getElementById('border-thickness-slider')['rangeslider-js'].update({value: thickness});

        $('#border-thickness-label span').text(thickness);

        this.adjustPopupPosition('left');

        this.isOpen = true;
        this.color = $(`#crop-container-${this.charge}`).find(".crop-container").attr('data-border');
    }

    hide() {
        $("#border-popup").hide();
        this.isOpen = false;
    }

    initPopup(container) {


        $(`#${container}`).append(this.render());
        this.hide();


        $(document).on('click', "#border-popup .apply", () => {
            this.applyBorder();
        });

        $(document).on('click', "#border-popup .cancel", () => {
            this.onModalClose();
        });
    }

    adjustPopupPosition(outOfSide) {
        let charge = $(`#crop-container-${this.charge}`);

        let offset = charge.offset();
        if (!offset)
            return;
        let height = charge.outerHeight();
        let width = charge.outerWidth();
        let css = {
            top: (window.innerWidth || document.documentElement.clientWidth) > 600 ? offset.top : offset.top + height,
            left: offset.left + width + 15
        };

        switch (outOfSide) {
            case 'top':
                break;
            case 'left':
                $('#border-popup').attr('class', 'right');
                break;
            case 'right':
                css.left = offset.left - $('#border-popup').width() - 40;
                $('#border-popup').attr('class', 'left');
                break;
            case 'bottom':
                break;
        }
        let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
        if (isMobile) {
            $('#border-popup').attr('class', 'top');
            css = {
                top: offset.top + height + 15,
                left: 0,
                right: 0,
                margin: '0 auto'
            }
        }
        //alert(window.innerWidth);
        $('#border-popup').css(css);
        this.outOfViewport();
    }

    outOfViewport() {
        let bounding = document.getElementById("border-popup").getBoundingClientRect();

        if (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) {
        } else {
            if (bounding.top < 0) {
                // Top is out of viewport
            } else if (bounding.left < 0) {
                // Left side is out of viewport
            } else if (bounding.right > (window.innerWidth || document.documentElement.clientWidth)) {
                // Right side is out of viewport
                this.adjustPopupPosition('right');
            }

        }
    }

    changeThickness(event) {
        let thickness = event.target ? event.target.value / window.MM_KOEF : event / window.MM_KOEF;
        $(`#crop-container-${this.charge}`).find(".border-frame").css('border-width', `${thickness}px`);
        $(`#crop-container-${this.charge}`).css('padding', `${thickness}px`);
        $(`#crop-container-${this.charge}`).cropper('update');
    }

    render() {
        this.isInititalized = true;
        const self = this;
        return `<div id="border-popup" class="right">
            <div id="border-thickness-container">
                <div id="border-thickness-label">Толщина: <span></span>мм</div>
                <input id="border-thickness-slider" type="range" min="0" max="50"  step="1">
            </div>
         
            <div id="color-picker" acp-color='${this.color}' acp-palette="PALETTE_MATERIAL_CHROME" acp-palette-editable
                 acp-show-rgb="no" acp-show-hsl="no" acp-show-hex="no">
            </div>
            <div style="display:flex; flex-direction:row;justify-content: center;">
                <button style="margin-right:15px" class="btn btn-success btn-sm apply">Применить</button>
                <button class="btn btn-danger btn-sm cancel" >Отмена</button>
            </div>
        </div>`

    }

    applyBorder() {
        $(`#crop-container-${this.charge}`).attr('data-border', this.color);
        $(`#crop-container-${this.charge}`).attr('data-border-thickness', this.newThickness);
        this.hide();
    }

    onModalClose() {
        let color = $(`#crop-container-${this.charge}`).attr('data-border');
        let thickness = $(`#crop-container-${this.charge}`).attr('data-border-thickness') || 3;
        $(`#crop-container-${this.charge}`).find(".border-frame").css('border', `${thickness / window.MM_KOEF}px solid ${color}`);
        $(`#crop-container-${this.charge}`).css('padding', `${thickness / window.MM_KOEF}px`);
        $(`#crop-container-${this.charge}`).cropper('update');
        this.hide();
    }
}
