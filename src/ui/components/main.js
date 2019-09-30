import {h, Component} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItemComponent} from "./item";
import tippy from 'tippy.js'

const uuid = require('uuid/v4');


export class MainComponent extends Component {


    constructor() {
        super();
        this.state = {
            width: '100%', height: '100%', urls: [], checkAll:false
        };

        this.sizes = [
            {
                title: '20x10',
                value: [20, 10]
            },
            {
                title: '10x15',
                value: [10, 15]
            },
            {
                title: '30x30',
                value: [30, 30]
            },
            {
                title: '30x90',
                value: [30, 90]
            },
            {
                title: '40x60',
                value: [40, 60]
            }
        ];
    }

    onFormatChange(size) {
        console.log(size);
        let container = {width: 280, height: 180};
        console.log(container.height / size[0], container.width / size[1]);
        // console.log(size[0]/size[1]);
        let ratio = size[1] / size[0];
        let pratio = container.width / container.height;
        //console.log(ratio);
        //console.log(pratio);

        if (size[0] === size[1]) {
            this.setState({width: '180px', height: '180px'});
        } else {
            let ratio = size[1] / size[0];
            if (ratio >= container.width / container.height) {
                //280/size[1]:180/x
                let height = 280 / size[1] * size[0];
                this.setState({width: '280px', height: `${height}px`});
            } else {
                let width = 180 / size[0] * size[1];
                this.setState({width: `${width}px`, height: '180px'});
            }

        }
        setTimeout(() => {
            $(`.crop-container`).cropper({url:'', fitToContainer: true});
        }, 100);
    };

    onFramingChange(framing) {

        console.log(framing);
        if(framing === 'cropp'){
            $(`.crop-container`).cropper({url:'', fitToContainer: false});
        }else{
            $(`.crop-container`).cropper('destroy');
        }

        tippy('.cut-line',{ content: document.getElementById('tippy-content-1').innerHTML,theme: 'light', });
        tippy('.offset-line',{ content: document.getElementById('tippy-content-2').innerHTML,theme: 'light', });
    }

    removeItem(uid) {
        console.log("|===  "+uid);
        const newState = this.state;
        const index = newState.urls.findIndex(a => a.uid === uid);

        console.log(index);
        if (index === -1) return;
        console.log(newState.urls[1]);
       // newState.urls.splice(1, 1);
        $(`#crop-container-${uid}`).cropper('destroy');
        $(`#crop-container-${uid}`).closest('.image-container').remove();
      //  this.setState(newState); // This will update the state and trigger a rerender of the components

    }

    onSelectChange(state){
        this.state.checkAll = state;
        this.setState(this.state);
    }


    render(props, state, context) {


        this.items = this.state.urls.map((item, key) =>
            <ImageItemComponent url={item.url} uid={item.uid} id={'crop-container'} width={this.state.width} height={this.state.height}
                                removeItem={this.removeItem.bind(this)} checkAll={this.state.checkAll}/>
        );

        let html = <div id="cropper-container">

            <div id="toolbar">
                <ToolbarComponent sizes={this.sizes}
                                  onSelectChange={(state) => this.onSelectChange(state)}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPapperChange={(val) => console.log(val)}
                                  onFramingChange={val => this.onFramingChange.call(this, val)}
                                  onBorderChange={(val) => console.log(val)}
                                  onOrderClick={(val) => this.props.onOrderClick()}
                />
            </div>
            <div id="main-section">
                {this.items}

            </div>
        </div>;
        return html;

    }

    componentDidMount() {
        this.state.urls = this.props.urls;

        this.setState(this.state);

        setTimeout(() => {

        }, 500)


    }
}
