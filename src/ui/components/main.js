import {h, Component} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItem} from "./item";

const dot = require('dot');
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import {Scrollbars} from 'react-custom-scrollbars';
import Scrollbar from "smooth-scrollbar";
import pagination from 'pagination';
import axios from 'axios';
import Swal from 'sweetalert2';

export class MainComponent extends Component {


    constructor() {
        super();

        this.state = {
            width: '100%',
            height: '100%',
            urls: [],
            checkAll: false,
            framing: 'whole',
            waiting: false,
            progress: false
        };
        this.framing = 'whole';
        this.size = {width: 15, height: 10};
        this.progress = 0;
        this.imageItemTemplate = new ImageItem().getHtml();


    }


    /*Fire when changed size*/
    onFormatChange(size) {
        this.size = {width: size[1], height: size[0]};
        this.changePhotoSize($(`.crop-container.enabled`), this.size);
        $(`.image-container:visible .crop-container.enabled`).cropper('update', {fitToContainer: this.framing !== 'cropp'});
        $(`.crop-container.enabled`).each((i, obj) => {
            setTimeout(() => {
                $(obj).cropper('update', {fitToContainer: this.framing !== 'cropp'})
            }, 10)
        });
    };

    /*Fired on paper change*/
    onPaperChange(paper) {
        this.paper = paper;
    }

    /*Fire when change cropping mode*/
    onFramingChange(framing) {
        this.framing = framing;
        $(`.image-container:visible .crop-container.enabled`).cropper('update', {fitToContainer: this.framing !== 'cropp'});
        $(`.crop-container.enabled`).each((i, obj) => {
            setTimeout(() => {
                $(obj).cropper('update', {fitToContainer: this.framing !== 'cropp'})
            }, 10)
        });
    }

    /*On change photo border*/
    onBorderChange(border) {
        this.border = border;
        if (border === 'none') {
            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none').css('z-index', 0);
            $(`.crop-container.enabled`).attr('data-border', 'none');
        } else {
            //$(`.crop-container.enabled`).css('border', `3px solid ${border}`);
            $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${border}`).css('z-index', 99);
            $(`.crop-container.enabled`).attr('data-border', border);
        }
    }


    /*Select/unselect all photos*/
    onSelectAllItems(checked) {
        let pagination = this.paginator.getPaginationData();

        let visibleItems = this.props.urls.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
            return `#${item.uid}`
        });

        let totalItems = $(`.crop-container`).length;
        let k = 100 / totalItems;
        if (totalItems >= 50)
            $('#loader').show();


        if (checked) {
            $('.image-container .crop-container').addClass('enabled');
            setTimeout(() => {
                this.changePhotoSize($(`.crop-container.enabled`), this.size);
                $(visibleItems.join(',')).find('.crop-container').cropper('update', {fitToContainer: this.framing === 'whole'});
                $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${$(`.crop-container.enabled`).attr('data-border')}`);
                if (this.border)
                    $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${this.border}`);
            }, 10);


            console.log(k);
            $(`.crop-container.enabled`).each((i, obj) => {
                setTimeout(() => {
                    // this.setState(this.state);

                    if (i + 1 >= totalItems) {
                        $('#loader').hide();
                    }
                    $(obj).cropper('update', {fitToContainer: this.framing === 'whole'})
                }, 10)
            });
            //setTimeout(() => { $(`.crop-container.enabled`).cropper('update', {fitToContainer: this.framing === 'whole'});}, 1000)

        } else {
            $('.image-container .crop-container').removeClass('enabled');
            /*  setTimeout(() => {
                  $('.image-container:visible .crop-container.enabled').css({
                      width: '100%',
                      height: '100%'
                  }).cropper('reset');
              }, 10);*/


            $(`.crop-container:not(.enabled)`).each((i, obj) => {
                setTimeout(() => {
                    if (i + 1 >= totalItems) {
                        $('#loader').hide();
                    }
                    $(obj).cropper('reset')
                }, 10)
            });

            $(visibleItems.join(',')).find('.crop-container').css({
                width: '100%',
                height: '100%'
            }).cropper('reset');

            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none');
        }

        $('.image-container input[type=checkbox]').prop('checked', checked);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
    }

    /*Select/unselect single item*/
    onItemSelect(target, checked) {
        let checkAll = false;
        $('.image-container input[type=checkbox]').each(function () {
            if ($(this).prop('checked')) {
                checkAll = true;
            }
        });

        if (checked) {
            target.addClass('enabled');
            this.changePhotoSize(target, this.size);
            target.cropper('update', {fitToContainer: this.framing === 'whole'});
            target.find('.border-frame').css('border', `3px solid ${target.attr('data-border')}`);
            if (this.border) {
                target.find('.border-frame').css('border', `3px solid ${this.border}`);
            } else {
                target.find('.border-frame').css('z-index', 0);
            }
        } else {
            target.find('.border-frame').css('border', 'none').css('z-index', 0);
            target.cropper('reset');
            target.removeClass('enabled');
        }

        $('#cropper-toolbar input[type=checkbox]').prop('checked', checkAll);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
    }

    /*Calculate sizes for photo*/
    changePhotoSize(container, size) {
        let containerSize = {width: 280, height: 180};
        if (size.width === size.height) {
            //this.setState({width: '180px', height: '180px'});
            container.css({width: '180px', height: '180px'});
        } else {
            let ratio = size.width / size.height;
            if (ratio >= containerSize.width / containerSize.height) {
                //280/size[1]:180/x
                let height = 280 / size.width * size.height;
                //this.setState({width: '280px', height: `${height}px`});
                container.css({width: '280px', height: `${height}px`});
            } else {
                let width = 180 / size.height * size.width;
                //this.setState({width: `${width}px`, height: '180px'});
                container.css({width: `${width}px`, height: '180px'});
            }

        }

    }

    /*Delete item*/
    removeItem(uid) {

        let confirmedRemove = () => {
            const index = this.props.urls.findIndex(a => a.uid === uid);
            if (index === -1) return;
            this.props.urls.splice(index, 1);
            $(`#crop-container-${uid}`).cropper('destroy');
            $(`#crop-container-${uid}`).closest('.image-container').remove();
            this.paginator.set('totalResult', this.props.urls.length);
            $('#pagination-bar').html(this.paginator.render());
            if (this.props.urls.length === 0) {
                $('#main-section .placeholder').show();
            }

            let pagination = this.paginator.getPaginationData();

            let visible = this.props.urls.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
                return `#${item.uid}`
            });

            $('.image-container').hide();
            $(visible.join(',')).show().find('.crop-container').cropper('update').cropper('update');
        };

        Swal.fire({
            title: 'Вы уверены?',
            text: 'Удалить фото?',
            type: 'question',
            showCancelButton: true,
            cancelButtonText: 'Отмена',
            confirmButtonText: 'Удалить'
        }).then(res => {
            if (res.value) {
                confirmedRemove();
            }
        })
    }

    /*Rotate image*/
    rotateImage(uid, deg) {
        let index = this.props.urls.findIndex(a => a.uid === uid);
        $(`#crop-container-${uid}`).append('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
        axios.post(`${this.props.handlerUrl}/rotate`, {
            url: this.props.urls[index].thumbnail || this.props.urls[index].url,
            uid: uid,
            deg: deg || 90,
            dest: this.props.dest
        }).then(response => {
            console.log(response.data);
            let target = $(`#crop-container-${uid}`);
            target.attr('data-rotate', response.data.deg >= 360 ? 0 : response.data.deg);
            target.html('');
            target.attr('data-src', `${response.data.filename}?v=${new Date().getTime()}`);
            target.cropper('update');
        }).catch(error => {
            $(`#crop-container-${uid} .lds-ring`).remove();
            console.log(error);
        })
    }

    /*Fire when clicked ORDER button*/
    onOrderClick() {
        let items = [];

        $('#cropper-container .image-item > div').each((i, e) => {

            let item = {
                url: this.props.urls[i].url,
                thumbnail: this.props.urls[i].thumbnail || this.props.urls[i].url,
                size: this.size,
                dest: this.props.dest,
                paper: this.paper || '',
                original: true
            };
            if ($(e).hasClass('enabled')) {

                let left = 100 * Math.abs(parseFloat($(e).find('img').css('left'))) / parseFloat($(e).find('img').css('width')) || 0;
                let top = 100 * Math.abs(parseFloat($(e).find('img').css('top'))) / parseFloat($(e).find('img').css('height')) || 0;
                let cropX = 100 * (parseFloat($(e).css('width'))) / parseFloat($(e).find('img').css('width'));
                let cropY = 100 * (parseFloat($(e).css('height'))) / parseFloat($(e).find('img').css('height'));


                item = Object.assign(item, {
                    crop: $(e).attr('data-crop') === 'true' ? {x: left, y: top, w: cropX, h: cropY} : false,
                    rotate: $(e).attr('data-rotate') || 0,
                    border: $(e).attr('data-border') || '',
                    zoom: $(e).attr('data-zoom'),
                    original: false
                });

            }

            if(!this.props.immediate){
                item = Object.assign(item, {
                    top: parseFloat($(e).find('img').css('top')),
                    left: parseFloat($(e).find('img').css('left')),
                });
            }

            items.push(item);
        });

        if (this.props.immediate) {
            axios.post(`${this.props.handlerUrl}/processing`, items).then(response => {
                console.log(response.data);
                this.props.onOrderClick(response.data);
            }).catch(error => {
                console.log(error);
            });
        }else{
            this.props.onOrderClick(items.reverse());
        }
    }

    /*Fire when add photo*/
    onPhotoAdded() {
        if (this.props.urls.length === 1) {
            $('#main-section .placeholder').hide();
        }

        this.paginator.set('totalResult', this.props.urls.length);
        $('#pagination-bar').html(this.paginator.render());

        let pagination = this.paginator.getPaginationData();
        if (pagination.current === 1) {

            let hidden = this.props.urls.slice(this.props.itemsPerPage).map((item, i) => {
                return `#${item.uid}`
            });

            $(hidden.join(',')).hide();
        } else {
            let visible = this.props.urls.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
                return `#${item.uid}`
            });

            $('.image-container').hide();
            $(visible.join(',')).show().find('.crop-container').cropper('update');
        }
        tippy('[data-tippy-content]', {
            'theme': 'light'
        });
    }

    /*Pagination*/
    goToPage(page) {
        this.paginator.set('current', page);
        $('#pagination-bar').html(this.paginator.render());
        let pagination = this.paginator.getPaginationData();

        let visible = this.props.urls.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
            return `#${item.uid}`
        });

        $('.image-container').hide();
        $(visible.join(',')).show().find('.crop-container').cropper('update');
    }

    /*Create pagination instance*/
    generatePagination() {
        this.paginator = new pagination.TemplatePaginator({
            prelink: '', current: 1, rowsPerPage: this.props.itemsPerPage,
            totalResult: this.props.urls.length, slashSeparator: true,
            template: function (result) {
                var i, len, prelink;
                var html = '<div><ul class="pagination">';
                if (result.pageCount < 2) {
                    html += '</ul></div>';
                    return '';
                }
                prelink = this.preparePreLink(result.prelink);
                if (result.previous) {
                    html += '<li class="page-item"><a class="page-link" href="#" data-page="' + result.previous + '">&#8249;</a></li>';
                }
                if (result.range.length) {
                    for (i = 0, len = result.range.length; i < len; i++) {
                        if (result.range[i] === result.current) {
                            html += '<li class="active page-item"><a class="page-link" href="#"  data-page="' + result.range[i] + '">' + result.range[i] + '</a></li>';
                        } else {
                            html += '<li class="page-item"><a class="page-link" href="#"  data-page="' + result.range[i] + '">' + result.range[i] + '</a></li>';
                        }
                    }
                }
                if (result.next) {
                    html += '<li class="page-item"><a class="page-link" href="#"  data-page="' + result.next + '" class="paginator-next">&#8250;</a></li>';
                }
                html += '</ul></div>';

                return result.previous || result.next ? html : '';
            }
        });
    }

    render(props, state, context) {

        let items = '';

        this.props.urls.map((item, key) => {
            return items += dot.template(this.imageItemTemplate)({
                url: item.url,
                top: item.top,
                left: item.left,
                zoom: item.zoom || 0,
                uid: item.uid
            });
        });


        $('#main-section').find(`.crop-container`).cropper({
            createUI: false,
            fitToContainer: true,
            left: -10,
            top: -30,
            initialZoom: 2,
            onLoad: (uid, width, height) => {
                console.log('onLoad  ' + width + " - " + height);
            }
        });

        $('#main-section').find(`.crop-container`).cropper('option', 'onZoom', (uid, value) => {
            let index = this.props.urls.findIndex(a => a.uid === uid);
            this.props.urls[index].zoom = value;
        });

        $('#main-section').find(`.crop-container`).cropper('option', 'onImgDrag', (uid, left, top) => {
            let index = this.props.urls.findIndex(a => a.uid === uid);
            this.props.urls[index].left = left;
            this.props.urls[index].top = top;
            console.log("onImgDrag " + left + ' - ' + top);
        });

        $('#main-section').find(`.crop-container`).cropper('option', 'onLoad', (uid, width, height) => {
            console.log(`onLoad  ${uid} = ` + width + " - " + height);
        });

        let html = <div id="cropper-container">
            <div className="spinner-container" id="loader" style="display: none">
                <div className="spinner"></div>
            </div>

            <div id="toolbar">
                <ToolbarComponent sizes={this.props.sizes}
                                  progress={this.progress}
                                  waiting={this.state.waiting}
                                  onSelectChange={(state) => this.onSelectAllItems(state)}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPaperChange={(val) => this.onPaperChange.call(this, val)}
                                  onFramingChange={val => this.onFramingChange.call(this, val)}
                                  onBorderChange={(val) => this.onBorderChange.call(this, val)}
                                  onOrderClick={(val) => this.onOrderClick()}
                />
            </div>
            <div id="main-section">

            </div>
            <div id="pagination-bar"></div>
            <div id="tippy-content-1" style="display: none;">
                <strong>Фото нестандартного формата.</strong>
                <div>Эта область обрежется при печати.</div>
            </div>
            <div id="tippy-content-2" style="display: none;">
                <strong>Фото нестандартного формата.</strong>
                <div>Останутся белые поля.</div>
            </div>
            <div id="tippy-content-3" style="display: none;">
                <strong>Фото низкого качества(current).</strong>
                <div>Советуем заменить на фото с более высоким разрешением(минимум min).</div>
            </div>
        </div>;
        return html;

    }


    componentDidMount() {
        this.state.urls = this.props.urls;

        this.setState(this.state);

        $(document).on('click', '.image-container .remove-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            this.removeItem(uid);
        });

        $(document).on('click', '.image-container .rotate-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            let deg = parseInt($(e.target).closest('.image-container').find('.crop-container').attr('data-rotate')) + 90;
            this.rotateImage(uid, deg > 360 ? 90 : deg);
        });

        $(document).on('change', '.image-container input[type=checkbox]', (e) => {
            this.onItemSelect($(e.target).closest('.image-container').find('.crop-container'), $(e.target).prop('checked'));
        });

        $(document).on('click', '.cropper-container', function (e) {
            $('.cropper-container').removeClass('active');
            $(this).addClass('active');
        });

        $(document).on('click', 'body', (e) => {
            if ($(e.target).closest('.image-container').length === 0) {
                $('.cropper-container').removeClass('active');
            }
        });

        setTimeout(() => {
            // Scrollbar.init(document.querySelector('#main-section'))
        }, 1000);


        this.generatePagination();

        $(document).on('click', '.pagination .page-link', (e) => {
            this.goToPage($(e.target).attr('data-page'));
            e.preventDefault();
        });

        $('#pagination-bar').html(this.paginator.render());


    }


}
