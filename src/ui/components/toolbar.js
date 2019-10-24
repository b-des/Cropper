import {h, Component} from "preact";

export class ToolbarComponent extends Component {
    constructor() {
        super();
        this.state = {sizeLabel: 'Формат', paperLabel: 'Бумага', framingLabel: 'Кадрирование', borderLabel: 'Рамка'}
        this.tooltip;
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

    onBorderChange(border) {
        if (border === 'black') {
            $(`.dropdown.border-select button`).html(`Черная рамка`);
        } else if (border === 'white') {
            $(`.dropdown.border-select button`).html(`Белая рамка`);
        } else {
            $(`.dropdown.border-select button`).html(`Без рамки`);
        }

        this.props.onBorderChange(border)
    }

    addControlTooltip() {
        $('.dropdown').find('button').addClass('disabled');
        if (!this.tooltip)
            this.tooltip = tippy('.dropdown .disabled', {content: 'Для изменения опций отметьте фотографии', theme: 'light',});
        this.tooltip.forEach((tooltip) => {
            tooltip.enable();
        });
    }

    removeControlTooltip() {
        if (this.tooltip)
            this.tooltip.forEach((tooltip) => {
                tooltip.disable();
            });
        $('.dropdown').find('button').removeClass('disabled');
    }

    componentDidMount() {
        this.addControlTooltip()
    }

    onOptionChange(id, value, name) {

        console.log(id, value, name );
        $(`.dropdown[data-option-id='${id}'] button`).html(name)
        this.props.onOptionChange(id, value, name)
    }

    render(props, state, context) {

        this.options = this.props.options.map((item) =>
            <div  className={`dropdown ${item.label}`} data-option-id={item.option_id}>
                <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                    {item.name}

                </button>
                <div className="dropdown-menu">
                    {item.option_values.map((option) => {
                        return <a className="dropdown-item" href="#" onClick={(e) => {this.onOptionChange(item.option_id, option.option_value_id, option.name); e.preventDefault();}}>{option.name}</a>
                    })}
                </div>
            </div>
        );
        this.sizes = props.sizes.map((item, key) =>
            <a className="dropdown-item" href="#" onClick={(e) => {
                this.props.onSizeChange(item.value);
                // $('.dropdown.size button').html(`Формат: ${item.title}`);
                e.preventDefault();
            }}>{item.title}</a>
        );



        return <nav className="bp3-dark" id="cropper-toolbar">
            <div>
                <div className="bp3-navbar-group bp3-align-left ">
                    <div className="select-items">
                        <div>Выбрано элементов: <span className="selected-items">0</span></div>
                        <div className="pretty p-svg p-curve p-pulse">
                            <input type="checkbox"
                                   onChange={(event) => this.props.onSelectChange(event.target.checked)}/>
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
                    {this.options}
                    <div className="dropdown size">
                        <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.sizeLabel}

                        </button>
                        <div className="dropdown-menu">
                            {this.sizes}
                        </div>
                    </div>

                    <div className="dropdown paper">
                        <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.paperLabel}

                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onPaperChange('glossy');
                                e.preventDefault()
                            }}>Глянцевая</a>
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onPaperChange('mate');
                                e.preventDefault()
                            }}>Матовая</a>
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onPaperChange('embossed');
                                e.preventDefault()
                            }}>Тиснёная</a>
                        </div>
                    </div>
                    <div className="dropdown framing">
                        <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.framingLabel}

                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onFramingChange('whole');
                                e.preventDefault()
                            }}>Кадр целиком</a>
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onFramingChange('cropp');
                                e.preventDefault()
                            }}>Кадр в обрез</a>

                        </div>
                    </div>
                    <div className="dropdown border-select">
                        <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {this.state.borderLabel}
                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onBorderChange('white');
                                e.preventDefault()
                            }}>Белая</a>
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onBorderChange('black');
                                e.preventDefault()
                            }}>Черная</a>
                            <a className="dropdown-item" href="#" onClick={(e) => {
                                this.onBorderChange('none');
                                e.preventDefault()
                            }}>Без рамки</a>
                        </div>
                    </div>


                    <button type="button" className="btn btn-sm btn-success border"
                            onClick={() => this.props.onOrderClick()}>Заказать
                    </button>

                    <div className="right-toolbar-tools">
                        <div>
                            <span>Кол-во: </span><input type="number" name="quantity" value="1" min="1" style="width: 50px"/>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => this.props.onDeleteAllClick()}>Удалить все
                            фото
                        </button>
                    </div>


                </div>

            </div>
        </nav>

    }


}
