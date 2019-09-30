import {h, Component} from "preact";
import tippy from 'tippy.js'


export class ImageItemComponent extends Component {


    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log("shouldComponentUpdate");
       // new CropperT(`#crop-container-${this.props.uid}`, {url: this.props.url});

        return true;
    }

    componentDidMount() {

    }

    onCheck(event) {
        console.log(`crop-container-${this.props.uid}`);
        console.log(event.target.checked);
    }


    render(props) {


        return (
            <div className="image-container ">
                <div className="tools">
                    <input type="checkbox" className="check-input" checked={this.props.checkAll} onChange={(event) => this.onCheck(event)}/>
                    <button className="btn btn-danger btn-sm" onClick={() => this.props.removeItem(this.props.uid)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
                <div className="image-item">
                    <div id={`crop-container-${this.props.uid}`} className='crop-container'
                         style={{width: this.props.width, height: this.props.height}} data-src={this.props.url}>
                        <img src={this.props.url} alt=""/>
                    </div>
                </div>
            </div>
        );
    }

}
