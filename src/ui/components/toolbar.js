import {Toolbar} from 'primereact/toolbar'
import {h, Component} from "preact";
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown';
import {OverlayPanel} from 'primereact/overlaypanel';
import '../styles/primeflex.css';



export  class ToolbarComponent extends Component{



    render(props, state, context) {

        function onSizeChange(value){
            console.log(value);
            console.log("changes size" + value);
            props.onSizeChange(value);
        }

        return <Toolbar>
            <div className="p-toolbar-group-left">
                <Button label="New" data-size='30x30' onClick={(e) => onSizeChange('30x30')} icon="pi pi-plus" style={{marginRight:'.25em'}} />
                <Button label="Upload" icon="pi pi-upload" className="p-button-success" />
                <i className="pi pi-bars p-toolbar-separator" style={{marginRight:'.25em'}} />
                <Dropdown value={this.state.city} options={props.cities} onChange={(e) => {this.setState({city: e.value})}} placeholder="Select a City"/>
                <Dropdown optionLabel="name" value={this.state.city} options={props.cities} onChange={(e) => {this.setState({city: e.value})}} placeholder="Select a City"/>

                <Button type="button" label="Basic" onClick={(e) => this.op.toggle(e)} />

                <OverlayPanel ref={(el) => this.op = el}>
                 <div className="photo-sizes" style={outerWidth = 400}>
                     <div className="p-grid p-dir-rev">
                         <div className="p-col" >1</div>
                         <div className="p-col">2</div>
                         <div className="p-col">3</div>
                     </div>

                     <div className="p-grid p-dir-col">
                         <div className="p-col">1</div>
                         <div className="p-col">2</div>
                         <div className="p-col">3</div>
                     </div>

                     <div className="p-grid p-dir-col-rev">
                         <div className="p-col">1</div>
                         <div className="p-col">2</div>
                         <div className="p-col">3</div>
                     </div>
                 </div>
                </OverlayPanel>
                <i className="pi pi-bars p-toolbar-separator" style={{marginRight:'.25em'}} />
                <Button label="Save" icon="pi pi-check" className="p-button-warning" />
            </div>
            <div className="p-toolbar-group-right">
                <Button icon="pi pi-search" style={{marginRight:'.25em'}} />
                <Button icon="pi pi-calendar" className="p-button-success" style={{marginRight:'.25em'}} />
                <Button icon="pi pi-times" className="p-button-danger" />
            </div>
        </Toolbar>
    }
}
