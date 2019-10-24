import {h, Component} from "preact";
const AColorPicker = require('a-color-picker');

export class BorderComponent extends Component {
    componentDidMount() {
        console.log('componentDidMount');
        AColorPicker.from('div#color-picker');
    }

    componentDidUpdate(previousProps, previousState, previousContext) {
        console.log('componentDidUpdate');
    }

    render(props, state, context) {
        return <div id="popup">
            <div id="overlay"></div>
            <div id="border-popup">
                <span class="close" onClick={() => this.props.onModalClose()}>&#x2715;</span>
                <div id="image-container">
                    <div className="image-item">
                        <div id="crop-container-87b7fbf6-fa7d-4e15-902b-63613b6368fd" className="crop-container cropper-container" data-uid="87b7fbf6-fa7d-4e15-902b-63613b6368fd" data-rotate=""
                             style="width:100%; height:100%" data-src="https://pechat.photo/image/customer/guest/3d685054081df4204c636b82034d7057/1234_f130b44b88b615463748e732de0a1fbf.jpg"
                             data-border="" data-zoom="0" data-top="" data-left="" data-fit-sizes="10x15,10x20" data-crop="false"><img
                            src="https://pechat.photo/image/customer/guest/3d685054081df4204c636b82034d7057/1234_f130b44b88b615463748e732de0a1fbf.jpg"
                            style="left: 0px; top: 2.5px; position: relative; width: 280px; height: auto;" />
                            <div className="border-frame"></div>
                             </div>
                    </div>
                </div>
                <div id="border-size">
                    <label htmlFor="thickness">Толщина(мм): </label><input type="number" value={3} name="" min={1} max={20} id="thickness"/>
                </div>
                <div id="color-picker"  acp-palette="PALETTE_MATERIAL_CHROME" acp-palette-editable acp-show-rgb="no" acp-show-hsl="no" acp-show-hex="no">
                </div>
                <div style="display:flex; flex-direction:row;justify-content: center;">
                    <button style="margin-right:15px" className="btn btn-success btn-sm" onClick={() => this.props.applyBorder()}>Применить</button>
                    <button className="btn btn-danger btn-sm" onClick={() => this.props.onModalClose()}>Отмена</button>
                </div>
            </div>

        </div>
    }
}
