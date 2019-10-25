import {h, Component} from "preact";

const AColorPicker = require('a-color-picker');

export class BorderComponent extends Component {
    constructor() {
        super();
        this.color = '';
    }

    componentDidMount() {
        this.initPopup()
    }

    componentDidUpdate(previousProps, previousState, previousContext) {
        console.log('componentDidUpdate');

        this.initPopup()
    }

    componentWillUnmount(){
        console.log('componentWillUnmount');
    }

    initPopup() {
        $('div#color-picker').html('');
        $("#thickness").val($(`#crop-container-${this.props.charge}`).attr('data-border-thickness') || 3);

        AColorPicker.from('div#color-picker').on('change', (picker, color) => {
            let thickness = $("#thickness").val();
            this.color = AColorPicker.parseColor(color, "hex");
            $(`#crop-container-${this.props.charge}`).find(".border-frame").css('border', `${thickness}px solid ${this.color}`);
        });

        this.adjustPopupPosition('left');


        this.color = $(`#crop-container-${this.props.charge}`).find(".crop-container").attr('data-border');
    }

    adjustPopupPosition(outOfSide) {
        let charge = $(`#crop-container-${this.props.charge}`);
        let offset = charge.offset();
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
        console.log(isMobile);
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
        console.log(bounding);
        console.log(window.innerWidth);
        if (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) {
            console.log('In the viewport!');
        } else {
            console.log('Not in the viewport... whomp whomp');
            if (bounding.top < 0) {
                // Top is out of viewport
                console.log('Top is out of viewport');
            } else if (bounding.left < 0) {
                // Left side is out of viewport
                console.log('Left side is out of viewport');
            } else if (bounding.right > (window.innerWidth || document.documentElement.clientWidth)) {
                // Right side is out of viewport
                console.log('Right side is out of viewport');
                this.adjustPopupPosition('right');
            }

        }
    }

    changeThickness(event) {
        $(`#crop-container-${this.props.charge}`).find(".border-frame").css('border-width', `${event.target.value}px`);
        $(`#crop-container-${this.props.charge}`).css('padding', `${event.target.value}px`);
        $(`#crop-container-${this.props.charge}`).cropper('update');
    }

    render(props, state, context) {
        return <div id="border-popup" className="right">
            <div id="image-container">

            </div>
            <div id="border-size">
                <label htmlFor="thickness">Толщина(мм): </label>
                <input type="number" value={3} name="" min={1} max={20} id="thickness"
                       onChange={this.changeThickness.bind(this)}/>
            </div>
            <div id="color-picker" acp-color={this.color} acp-palette="PALETTE_MATERIAL_CHROME" acp-palette-editable
                 acp-show-rgb="no" acp-show-hsl="no" acp-show-hex="no">
            </div>
            <div style="display:flex; flex-direction:row;justify-content: center;">
                <button style="margin-right:15px" className="btn btn-success btn-sm"
                        onClick={() => this.applyBorder()}>Применить
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => this.onModalClose()}>Отмена</button>
            </div>
        </div>

    }

    applyBorder() {
        $(`#crop-container-${this.props.charge}`).attr('data-border', this.color);
        $(`#crop-container-${this.props.charge}`).attr('data-border-thickness', $("#thickness").val());
        this.props.onModalClose();
    }

    onModalClose() {
        let color = $(`#crop-container-${this.props.charge}`).attr('data-border');
        let thickness = $(`#crop-container-${this.props.charge}`).attr('data-border-thickness') || 3;
        $(`#crop-container-${this.props.charge}`).find(".border-frame").css('border', `${thickness}px solid ${color}`);
        this.props.onModalClose();
    }
}
