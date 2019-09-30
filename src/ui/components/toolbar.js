import {h, Component} from "preact";


export class ToolbarComponent extends Component {
    constructor() {
        super();
        this.state = {sizeLabel: 'Формат', paperLabel: 'Бумага',framingLabel: 'Кадрирование',borderLabel: 'Рамка'}
    }

    render(props, state, context) {

        this.sizes = props.sizes.map((item, key) =>
            <a className="dropdown-item" onClick={() => {
                this.props.onSizeChange(item.value);
                this.setState({sizeLabel: `Формат: ${item.title}`});
            }}>{item.title}</a>
        );


        return <nav className="bp3-dark">
            <div>
                <div className="bp3-navbar-group bp3-align-left ">
                    <input type="checkbox" onChange={(event) => this.props.onSelectChange(event.target.checked)}/>

                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.sizeLabel}

                        </button>
                        <div className="dropdown-menu">
                            {this.sizes}
                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.paperLabel}

                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" onClick={() => this.props.onPapperChange('glossy')}>Глянцевая</a>
                            <a className="dropdown-item" onClick={() => this.props.onPapperChange('mate')}>Матовая</a>
                            <a className="dropdown-item" onClick={() => this.props.onPapperChange('embossed')}>Тиснёная</a>
                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.framingLabel}

                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" onClick={() => {this.props.onFramingChange('whole');
                                this.setState({framingLabel: `Кадр целиком`});}}>Кадр целиком</a>
                            <a className="dropdown-item" onClick={() => {this.props.onFramingChange('cropp');
                                this.setState({framingLabel: `Кадр в обрез`});}}>Кадр в обрез</a>

                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.borderLabel}
                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" onClick={() => this.props.onBorderChange('white')}>Белая</a>
                            <a className="dropdown-item" onClick={() => this.props.onBorderChange('black')}>Черная</a>
                            <a className="dropdown-item" onClick={() => this.props.onBorderChange('none')}>Без рамки</a>
                        </div>
                    </div>


                    <button type="button" className="btn btn-sm btn-success" onClick={() => this.props.onOrderClick()}>Заказать</button>
                </div>
            </div>
        </nav>

    }
}
