import {h, Component} from "preact";

const AColorPicker = require('a-color-picker');

export class BorderComponent {
    constructor() {
        this.color = '';
        this.isInititalized = false;
        this.isOpen = false;
        this.charge = null;

    }

    isInitialized(){
        return this.isInititalized;
    }

    show(charge){
        if(this.isOpen){
            this.onModalClose();
        }
        $("#border-popup").show();
        this.charge = charge;
        $('div#color-picker').html('');

        $("#thickness").val(+$(`#crop-container-${this.charge}`).attr('data-border-thickness') || 3);
        console.log(+$(`#crop-container-${this.charge}`).attr('data-border-thickness') || 3);

        AColorPicker.from('div#color-picker').on('change', (picker, color) => {
            let thickness = $("#thickness").val() / window.MM_KOEF;
            this.color = AColorPicker.parseColor(color, "hex");
            $(`#crop-container-${this.charge}`).find(".border-frame").css('border', `${thickness}px solid ${this.color}`);
        });

        this.adjustPopupPosition('left');

        this.isOpen = true;
        this.color = $(`#crop-container-${this.charge}`).find(".crop-container").attr('data-border');
    }

    hide(){
        $("#border-popup").hide();
        this.isOpen = false;
    }

    initPopup(container) {


        console.log($(`#${container}`));
        $(`#${container}`).append(this.render());
        this.hide();

        $(document).on('change input', "#thickness", (event) => {
            console.log(event.target.value);
            this.changeThickness(event);
        });

        $(document).on('click', "#border-popup .apply", () => {
            this.applyBorder();
        });

        $(document).on('click', "#border-popup .cancel", () => {
           this.onModalClose();
        });
    }

    adjustPopupPosition(outOfSide) {
        let charge = $(`#crop-container-${this.charge}`);
        console.log(charge);
        console.log(this.charge);

        let offset = charge.offset();
        if(!offset)
            return;
        let height = charge.height();
        let width = charge.width();
        let css = {
            top: (window.innerWidth || document.documentElement.clientWidth) > 600 ? offset.top : offset.top + height,
            left: offset.left + width + 10
        };

        switch (outOfSide) {
            case 'top':
                break;
            case 'left':
                $('#border-popup').attr('class', 'right');
                break;
            case 'right':
                css.left = offset.left-$('#border-popup').width() - 40;
                $('#border-popup').attr('class', 'left');
                break;
            case 'bottom':
                break;
        }
        let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
        if (isMobile) {
            $('#border-popup').attr('class', 'top');
            css = {
                top: offset.top + height + 10,
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
        ) {} else {
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
        console.log(event);
        let thickness = event.target.value / window.MM_KOEF;
        $(`#crop-container-${this.charge}`).find(".border-frame").css('border-width', `${thickness}px`);
        $(`#crop-container-${this.charge}`).css('padding', `${thickness}px`);
        $(`#crop-container-${this.charge}`).cropper('update');
    }

    render() {
        this.isInititalized = true;
        const self = this;
        return `<div id="border-popup" class="right">
            <div id="image-container">

            </div>
            <div id="border-size">
                <label for="thickness">Толщина(мм): </label>
                <input type="number" value="3" name="" min="1" max="20" id="thickness"/>
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
        $(`#crop-container-${this.charge}`).attr('data-border-thickness', $("#thickness").val());
        this.hide();
    }

    onModalClose() {
        let color = $(`#crop-container-${this.charge}`).attr('data-border');
        let thickness = $(`#crop-container-${this.charge}`).attr('data-border-thickness') || 3;
        $(`#crop-container-${this.charge}`).find(".border-frame").css('border', `${thickness / window.MM_KOEF}px solid ${color}`);
        this.hide();
    }
}
