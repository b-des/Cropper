import {h, Component} from "preact";

const AColorPicker = require('a-color-picker');

export class BorderComponent extends Component {
    componentDidMount() {
        console.log('componentDidMount');
        console.log(this.props.charge);
        AColorPicker.from('div#color-picker');

        let charge = $(`#crop-container-${this.props.charge}`);
        console.log(charge.offset());
        let offset = charge.offset();
        let height = charge.height();
        let width = charge.width();
        $('#border-popup').css({
            top: offset.top ,
            left: offset.left + width + 8
        })
    }

    componentDidUpdate(previousProps, previousState, previousContext) {
        console.log('componentDidUpdate');
    }

    render(props, state, context) {
        return<div id="border-popup">
                <div id="image-container">

                </div>
                <div id="border-size">
                    <label htmlFor="thickness">Толщина(мм): </label><input type="number" value={3} name="" min={1} max={20} id="thickness"/>
                </div>
                <div id="color-picker" acp-palette="PALETTE_MATERIAL_CHROME" acp-palette-editable acp-show-rgb="no" acp-show-hsl="no" acp-show-hex="no">
                </div>
                <div style="display:flex; flex-direction:row;justify-content: center;">
                    <button style="margin-right:15px" className="btn btn-success btn-sm" onClick={() => this.props.applyBorder()}>Применить</button>
                    <button className="btn btn-danger btn-sm" onClick={() => this.props.onModalClose()}>Отмена</button>
                </div>
            </div>

    }
}
