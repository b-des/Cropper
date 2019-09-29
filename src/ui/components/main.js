import {h, Component} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItemComponent} from "./item";


export class MainComponent extends Component {
    constructor() {
        super();
        this.state = {width: '100%', height: '100%'}
    }

    render(props, state, context) {

        let sizes = [
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

        let onFormatChange = (size) => {
            console.log(size);
            let container = {width: 280, height: 180};
            console.log(container.height/size[0], container.width/size[1]);
            // console.log(size[0]/size[1]);
            let ratio = size[1] / size[0];
            let pratio = container.width / container.height;
            //console.log(ratio);
            //console.log(pratio);

            if(size[0] === size[1]){
                this.setState({width: '180px', height: '180px'});
                new CropperT('cropContainerPreload',{});
            }else{
                let ratio = size[1] / size[0];
                if(ratio >= container.width / container.height){
                    //280/size[1]:180/x
                    let height = 280/size[1]*size[0];
                    this.setState({width: '280px', height: `${height}px`});
                }else{
                    let width = 180/size[0]*size[1];
                    this.setState({width: `${width}px`, height: '180px'});
                }
                setTimeout(()=>{
                    new CropperT('cropContainerPreload',{});
                }, 100);
            }

        };
        let html = <div id="cropper-container">
            <div id="template" style="display: none;">
                <strong>Bolded content</strong>
            </div>
            <div id="toolbar">
                <ToolbarComponent sizes={sizes}
                                  onSizeChange={onFormatChange}
                                  onPapperChange={(val) => console.log(val)}
                                  onFramingChange={(val) => console.log(val)}
                                  onBorderChange={(val) => console.log(val)}
                                  onOrderClick={(val) => this.props.onOrderClick()}
                />
            </div>
            <div id="main-section">
                <ImageItemComponent url={'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__340.jpg'} width={this.state.width} height={this.state.height}/>
                <ImageItemComponent url={'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__340.jpg'}/>
            </div>
        </div>;
        return html;

    }
}
