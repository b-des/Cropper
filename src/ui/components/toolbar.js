import {h, Component} from "preact";
import findDuplicates from 'array-find-duplicates';
import Swal from "sweetalert2";

export class ToolbarComponent extends Component {
    constructor() {
        super();
        this.tooltip = null;
        this.tooltipOptionItem = null;
        this.exludedOptions = {};
        this.selectedOptions = {};
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
        if (framing !== 'whole' && framing !== 'cropp') {
            framing = 'whole';
        }

        this.props.onFramingChange.call(this, framing);
    }

    onBorderChange(border) {
        if (border === 'black') {
            $(`.dropdown.border-select button`).html(`Черная рамка`);
            this.state.borderLabel = `Черная рамка`;
        } else if (border === 'white') {
            $(`.dropdown.border-select button`).html(`Белая рамка`);
            this.state.borderLabel = `Белая рамка`;
        } else {
            $(`.dropdown.border-select button`).html(`Без рамки`);
            this.state.borderLabel = `Без рамки`;
        }


        this.props.onBorderChange(border)
    }

    addControlTooltip() {
        $('.dropdown').find('button').addClass('disabled');
        if (!this.tooltip)
            this.tooltip = tippy('.dropdown .disabled', {
                content: 'Для изменения опций отметьте фотографии',
                theme: 'light',
            });
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


    onOptionChange(event, id, value, name, itemLabel, optionLabel) {
        if (event && $(event.target).hasClass('unsuitable'))
            return;
        this.props.onOptionChange(id, value, {itemLabel, optionLabel});
        if (!value)
            return;
        this.selectedOptions[id] = value;
        $(`[data-option-id="${id}"]`).find('button').removeClass('btn-danger').html(name);
        switch (itemLabel) {
            case 'size':
                this.props.onSizeChange(optionLabel);
                $(`.dropdown.size button`).html(name);
                break;
     /*       case 'paper':
                this.onPaperChange(option_label);
                break;*/
            case 'framing':
                this.onFramingChange(optionLabel);
                break;
            case 'border-select':
                this.onBorderChange(optionLabel);
                break;
        }
    }

    excludeUnsuitableOptions(event, current_option, relative_options, option_name, option_value, item_label, option_label) {
        if (!relative_options && !$(event.target).hasClass('unsuitable'))
            return;

        if (event && $(event.target).hasClass('unsuitable')) {
            Swal.fire({
                title: 'Конфликт опций',
                text: 'Несовместимые опции будут сброшены. Вы согласны?',
                type: 'question',
                showCancelButton: true,
                cancelButtonText: 'Отмена',
                confirmButtonText: 'Продолжить'
            }).then(res => {
                if (res.value) {

                        this.onOptionChange(null, current_option, option_value, option_name, item_label, option_label);
                    //console.log(this.selectedOptions);

                    if (relative_options)
                        relative_options.map(option => {
                            if (!option.option_value_id.includes(this.selectedOptions[option.option_id]) ) {
                                let item = this.props.options.filter(item => +item.option_id === +option.option_id)[0];
                                this.onOptionChange(null, option.option_id, 0);
                                $(`[data-option-id="${option.option_id}"]`).find('button').addClass('btn-danger').html(item ? item.name : "");
                                $(`[data-option-id="${option.option_id}"]`).find('a, span').removeClass('active');
                            }
                        });
                        this.props.options.map((item) => {
                            //console.log(item);

                            if (+item.option_id !== +current_option) {
                                //$(`[data-option-id="${item.option_id}"]`).find('button').addClass('btn-danger').html(item.name);
                            }
                        });
                    $(`[data-option-id=${current_option}]`).find(`a`).removeClass('unsuitable');
                    $(`[data-option-id="${current_option}"]`).find('button').removeClass('btn-danger').html(option_name);
                }
            });

            // return false;
        }

        if (!relative_options)
            return;
        //$(`#cropper-toolbar .dropdown[data-option-id=${current_option}]`).find('a').removeClass('disabled');
        relative_options.map(option => {
            if (!this.exludedOptions[current_option])
                this.exludedOptions[current_option] = {[option.option_id]: option.option_value_id};
            else
                this.exludedOptions[current_option][option.option_id] = option.option_value_id;
        });

        let enabled = {};
        // $(`#cropper-toolbar .dropdown:not([data-option-id='${current_option}']) a`).addClass('disabled');
        $(`#cropper-toolbar .dropdown:not([data-option-id='${current_option}']) a`).addClass('unsuitable');
        $(`.item-options .dropdown:not([data-option-id='${current_option}']) a`).addClass('disabled');

        Object.entries(this.exludedOptions).map(option => {
            Object.entries(option[1]).map(item => {
                enabled[item[0]] = enabled[item[0]] ? this.unionDuplicates(enabled[item[0]], item[1]) : item[1];
            })
        });

        Object.entries(enabled).map(option => {
            option[1].map(value_id => {
                $(`.dropdown[data-option-id=${option[0]}]`).find(`a[data-option-value-id=${value_id}]`).removeClass('disabled');
                $(`#cropper-toolbar .dropdown[data-option-id=${option[0]}]`).find(`a[data-value-id=${value_id}]`).removeClass('unsuitable');
            });
        });
    }

    unionDuplicates(arr1, arr2) {
        return [...new Set([].concat(...findDuplicates(arr1.concat(arr2))))];
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return false;
    }

    componentDidMount() {
        this.addControlTooltip();
        $(document).on('input change', '#cropper-toolbar [name="quantity"]', (e) => {
            if (e.target.value > 0) {
                $('.image-container').find('[name="quantity"]').val(e.target.value)
            }
            this.props.onOptionChange();
        });

    }

    componentWillMount() {

        this.options = this.props.options.map((item) => {
                let default_id = this.props.defaultOptions.filter(option => +option.option_id === +item.option_id).map(option => option.option_value_id)[0];
                let default_option = item.option_values.filter(value => +value.option_value_id === +default_id)[0];


                if (default_id && default_option) {
                    this.onOptionChange(+item.option_id, +default_option.option_value_id, null, item.label, default_option.value || default_option.label);
                    setTimeout(() => {
                        this.excludeUnsuitableOptions(null, item.option_id, default_option.relation_options);
                    }, 1000);
                }
                return <div>
                    <span>{item.name}:</span>
                    <div className={`dropdown ${item.label}`} data-option-id={item.option_id}>
                        <button className="btn btn-sm btn-primary dropdown-toggle disabled" type="button"
                                data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            {default_option ? default_option.name : item.name}

                        </button>
                        <div className="dropdown-menu">
                            {item.option_values.map((option) => {
                                return <a className="dropdown-item" href="#" data-value-id={option.option_value_id}
                                          onClick={(e) => {
                                              this.onOptionChange(e, item.option_id, option.option_value_id, option.name, item.label, option.label || option.value);
                                              this.excludeUnsuitableOptions(e, item.option_id, option.relation_options, option.name, option.option_value_id, item.label, option.label || option.value);
                                              e.preventDefault();
                                          }}>{option.name}</a>
                            })}
                        </div>
                    </div>
                </div>
            }
        );
    }

    render(props, state, context) {


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
                        <div className="pretty p-svg p-curve p-pulse" style={{'display':'none'}}>
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


                    <button type="button" className="btn btn-sm btn-success border"
                            onClick={() => this.props.onOrderClick()}>Заказать
                    </button>

                    <div className="right-toolbar-tools">
                        <div>
                            <span>Кол-во: </span><input type="number" name="quantity" value="1" min="1"
                                                        style="width: 50px"/>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => this.props.onDeleteAllClick()}>
                            Удалить все фото
                        </button>
                    </div>


                </div>

            </div>
        </nav>

    }


}
