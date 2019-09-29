import {h, Component} from "preact";
import tippy from 'tippy.js'


export class ImageItemComponent extends Component {

    render({url, width, height}) {


        return (
            <div className="image-item">

               <div id="cropContainerPreload" style={{width: width, height: height}}>
                   <img src={url} alt=""/>
               </div>
            </div>
        );
    }
}