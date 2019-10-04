import {h, Component} from "preact";

export class ToolbarComponent extends Component {
    constructor() {
        super();
        this.state = {sizeLabel: 'Формат', paperLabel: 'Бумага', framingLabel: 'Кадрирование', borderLabel: 'Рамка'}
    }

    onPaperChange(type) {
        this.props.onPaperChange(type);
        if (type === 'glossy') {
            $(`.dropdown.paper button`).html('Глянцевая бумага');
        } else if (type === 'mate') {
            $(`.dropdown.paper button`).html('Матовая бумага');
        } else {
            $(`.dropdown.paper button`).html('Тиснёная бумага');
        }
    }

    onFramingChange(framing) {
        if (framing === 'cropp') {
            $(`.dropdown.framing button`).html('Кадр в обрез');
        } else {
            $(`.dropdown.framing button`).html('Кадр целиком');
        }

        this.props.onFramingChange.call(this, framing);
    }

    render(props, state, context) {

        this.sizes = props.sizes.map((item, key) =>
            <a className="dropdown-item" href="#" onClick={() => {
                this.props.onSizeChange(item.value);
                $('.dropdown.size button').html(`Формат: ${item.title}`);
            }}>{item.title}</a>
        );


        return <nav className="bp3-dark" id="cropper-toolbar">
            <div>
                <div className="bp3-navbar-group bp3-align-left ">
                  <div className="select-items">
                      <div>Выбрано элементов: <span className="selected-items">0</span></div>
                      <div className="pretty p-svg p-curve p-pulse">
                          <input type="checkbox" onChange={(event) => this.props.onSelectChange(event.target.checked)}/>
                          <div className="state p-success">
                              <svg className="svg svg-icon" viewBox="0 0 20 20">
                                  <path
                                      d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                      style="stroke: white;fill:white;"></path>
                              </svg>
                              <label></label>
                          </div>
                      </div>
                  </div>
                    <div className="dropdown size">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.sizeLabel}

                        </button>
                        <div className="dropdown-menu">
                            {this.sizes}
                        </div>
                    </div>

                    <div className="dropdown paper">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.paperLabel}

                        </button>
                        <div className="dropdown-menu" >
                            <a className="dropdown-item" href="#" onClick={() => this.onPaperChange('glossy')}>Глянцевая</a>
                            <a className="dropdown-item" href="#" onClick={() => this.onPaperChange('mate')}>Матовая</a>
                            <a className="dropdown-item" href="#" onClick={() => this.onPaperChange('embossed')}>Тиснёная</a>
                        </div>
                    </div>
                    <div className="dropdown framing">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.framingLabel}

                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item"href="#" onClick={() => this.onFramingChange('whole')}>Кадр целиком</a>
                            <a className="dropdown-item"href="#" onClick={() => this.onFramingChange('cropp')}>Кадр в обрез</a>

                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="btn btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.borderLabel}
                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#" onClick={() => this.props.onBorderChange('white')}>Белая</a>
                            <a className="dropdown-item" href="#" onClick={() => this.props.onBorderChange('black')}>Черная</a>
                            <a className="dropdown-item" href="#" onClick={() => this.props.onBorderChange('none')}>Без рамки</a>
                        </div>
                    </div>


                    <button type="button" className="btn btn-sm btn-success"
                            onClick={() => this.props.onOrderClick()}>Заказать
                    </button>
                </div>
            </div>
        </nav>

    }
}
