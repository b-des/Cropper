import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './ui/styles/main.css';
import { h, Component, render } from 'preact';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {ToolbarComponent} from "./ui/components/toolbar";
const citySelectItems = [
    {label: 'New York', value: 'NY'},
    {label: 'Rome', value: 'RM'},
    {label: 'London', value: 'LDN'},
    {label: 'Istanbul', value: 'IST'},
    {label: 'Paris', value: 'PRS'}
];
import htm from 'preact';
class Clock extends Component {
    changeSize(size){
        console.log(`changeSize ${size}`);
    }

    render() {
        let time = new Date();
        return  <div>
            <ToolbarComponent cities={citySelectItems} onSizeChange={this.changeSize}/>
            <Dialog header="Godfather I" visible={this.state.visible} style={{width: '50vw'}} modal={true} onHide={() => this.setState({visible: false})}>
            The story begins as Don Vito Corleone, the head of a New York Mafia family, oversees his daughter's wedding.
            His beloved son Michael has just come home from the war, but does not intend to become part of his father's business.
            Through Michael's life the nature of the family business becomes clear. The business of the family is just like the head of the family,
            kind and benevolent to those who give respect, but given to ruthless violence whenever anything stands against the good of the family.
        </Dialog>
            <Button label="Show" icon="pi pi-info-circle" onClick={(e) => this.setState({visible: true})} />

        </div>;
    }
}

export default class Cropper {
    test(){
        console.log("works!!!");

        render(<Clock />, document.body);
    }
}
