import {h, Component, createRef} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItem} from "./item";
import uuid from 'uuid/v4';
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

        this.child = createRef();
    }


    /*Fire when changed size*/
    onFormatChange(size) {
        this.size = {width: size[1], height: size[0]};
        this.changePhotoSize($(`.crop-container.enabled`), this.size);
        $(`.image-container:visible .crop-container.enabled`).cropper('update', {fitToContainer: this.framing !== 'cropp'});
       /* $(`.crop-container.enabled`).each((i, obj) => {
            setTimeout(() => {
                $(obj).cropper('update', {fitToContainer: this.framing !== 'cropp'})
            }, 10)
        });*/
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
            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none').css('z-index', '-1');
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

        if (checked) {
            $('.image-container .crop-container').addClass('enabled');
            setTimeout(() => {
                this.changePhotoSize($(`.crop-container.enabled`), this.size);
                $(visibleItems.join(',')).find('.crop-container').cropper('update', {fitToContainer: this.framing === 'whole'});
                if($(`.crop-container.enabled`).attr('data-border'))
                    $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${$(`.crop-container.enabled`).attr('data-border')}`);
                if (this.border)
                    $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${this.border}`);
            }, 10);
            this.child.current.removeControlTooltip();
        } else {
            $('.image-container .crop-container').removeClass('enabled');
                $(visibleItems.join(',')).find('.crop-container').css({
                width: '100%',
                height: '100%'
            }).cropper('reset');

            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none');
            this.child.current.addControlTooltip();
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

            if (this.border) {
                target.find('.border-frame').css('border', `3px solid ${this.border}`);
            } else {
                target.find('.border-frame').css('z-index', '-1');
            }
        } else {
            target.find('.border-frame').css('border', 'none').css('z-index', '-1');
            target.cropper('reset');
            target.removeClass('enabled');
        }

        if(checkAll){
            this.child.current.removeControlTooltip();
        }else{
            this.child.current.addControlTooltip();
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
        this.size = {width: size.width, height: size.height};
        $('.dropdown.size button').html(`Формат: ${size.height}x${size.width}`);
    }

    /*Clone image*/
    cloneItem(uid){
        const index = this.props.urls.findIndex(a => a.uid === uid);
        let photo = this.props.urls[index];
        let item = JSON.parse(JSON.stringify(photo));
        item.uid = uuid();
        this.props.urls.push(item);

        let html = dot.template(this.imageItemTemplate)({
            url: photo.thumbnail || photo.url,
            top: photo.top === 0 ? 0 : photo.top || '',
            left: photo.left === 0 ? 0 : photo.left || '',
            zoom: photo.zoom || 0,
            uid: item.uid,
            border: photo.border || '',
            rotate: photo.rotate || '',
            checked:  null
        });

        $(html).insertAfter(`#${uid}`);
        $(`#${item.uid}`).find('.crop-container').cropper({onLoad: () => {}, createUI: false});
        this.paginator.set('totalResult', this.props.urls.length);
        $('#pagination-bar').html(this.paginator.render());
        tippy('[data-tippy-content]', {'theme': 'light'});
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

    /*Delet all images*/
    deleteAllItems(){
        let confirmedRemove = () => {
            this.props.urls = [];
            $('.image-container').remove();
            this.paginator.set('totalResult', this.props.urls.length);
            $('#pagination-bar').html(this.paginator.render());
            $('.placeholder').show();
        };
        Swal.fire({
            title: 'Вы уверены?',
            text: 'Удалить все фото?',
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
            url: this.props.urls[index].url,
            uid: uid,
            deg: deg || 90,
            dest: this.props.dest
        }).then(response => {

            let target = $(`#crop-container-${uid}`);
            target.attr('data-rotate', response.data.deg >= 360 ? 0 : response.data.deg);
            target.html('');
            target.attr('data-src', `${response.data.filename}?v=${new Date().getTime()}`);
            target.cropper('update');

            if(this.border && this.border !== 'none'){
                target.find('.border-frame').css('z-index', `99`);
            }
        }).catch(error => {
            $(`#crop-container-${uid} .lds-ring`).remove();
        })
    }

    /*Fire when clicked ORDER button*/
    onOrderClick() {
        let items = [];

        $('#cropper-container .image-item > div').each((i, e) => {

            let item = {
                url: this.props.urls[i].url,
                thumbnail: $(e).attr('data-src') || this.props.urls[i].thumbnail || this.props.urls[i].url,
                size: this.size,
                dest: this.props.dest,
                paper: this.paper || '',
                crop:false,
                original: true,
                quantity: parseInt($('[name="quantity"]').val())
            };
            if ($(e).hasClass('enabled')) {

                let left = 100 * Math.abs(parseFloat($(e).find('img').css('left'))) / parseFloat($(e).find('img').css('width')) || 0;
                let top = 100 * Math.abs(parseFloat($(e).find('img').css('top'))) / parseFloat($(e).find('img').css('height')) || 0;
                let cropX = 100 * (parseFloat($(e).css('width'))) / parseFloat($(e).find('img').css('width'));
                let cropY = 100 * (parseFloat($(e).css('height'))) / parseFloat($(e).find('img').css('height'));

                item = Object.assign(item, {
                    crop: $(e).attr('data-crop') === 'true' ? {
                        x: isFinite(left) ? left : 0,
                        y: isFinite(top) ? top: 0,
                        w: isFinite(cropX)? cropX: 0,
                        h: isFinite(cropY)? cropY: 0} : false,
                    rotate: $(e).attr('data-rotate') || 0,
                    border: $(e).attr('data-border') || '',
                    zoom: $(e).attr('data-zoom'),
                    original: false
                });

                if(this.props.urls[i].crop && (!item.crop.w || !item.crop.h)){
                    item.crop = this.props.urls[i].crop;
                }

            }
            if (!this.props.immediate) {
                item = Object.assign(item, {
                    top: (!item.crop.w && !item.crop.h) ? '' : parseFloat($(e).find('img').css('top')),
                    left: (!item.crop.w && !item.crop.h) ? '' : parseFloat($(e).find('img').css('left')),
                });
            }

            items.push(item);
        });


        if (this.props.immediate) {
            this.props.onProcessingStart({status: 'start', count: items.length});

            axios.post(`${this.props.handlerUrl}/processing`, items).then(response => {
                if(this.props.onOrderClick)
                    this.props.onOrderClick(response.data);
            }).catch(error => {
                if(this.props.onOrderClick)
                    this.props.onOrderClick(error);
            });


            /*Alternative method for send images to backend*/
            /*
            * if(items.length > 100){
                items = this.chunkArray(items, 100);
            }else{
                items = [items];
            }
            console.log(items.length);
            let tmpResponse = [];
            let i = 0;
            for (let item of items){
                axios.post(`${this.props.handlerUrl}/processing`, item).then(response => {
                    tmpResponse.push(response.data);
                    console.log(++i);
                    if(i === items.length){
                        console.log(items.length);
                        if(this.props.onOrderClick)
                            this.props.onOrderClick([].concat(...tmpResponse));
                    }

                }).catch(error => {
                    if(this.props.onOrderClick)
                        this.props.onOrderClick(error);
                });
            }*/
        } else {
            this.props.onOrderClick(items.reverse());
        }
    }

     chunkArray(myArray, chunk_size){
        var index = 0;
        var arrayLength = myArray.length;
        var tempArray = [];

        for (index = 0; index < arrayLength; index += chunk_size) {
           let myChunk = myArray.slice(index, index+chunk_size);
            tempArray.push(myChunk);
        }

        return tempArray;
    }

    /*Fire when add photo*/
    onPhotoAdded(border, crop, firstElement, lastElement) {
        $('#main-section .placeholder').hide();

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
        let length = $('.image-container input[type=checkbox]:checked').length;
        $('#cropper-toolbar .selected-items').html(length);
        if (length){
            $('#cropper-toolbar input[type=checkbox]').prop('checked', 'checked');
            $(`.dropdown.framing button`).html('Кадр целиком');
            this.child.current.removeControlTooltip();
        }

        if (firstElement.size || lastElement.size){
            this.changePhotoSize($(`.crop-container.enabled`), firstElement.size || lastElement.size);
            if(crop){
                this.framing = 'cropp';
                $(`.dropdown.framing button`).html('Кадр в обрез');
            }
        }

        if (border){
            this.border = border;
            if (border === 'black') {
                $(`.dropdown.border-select button`).html(`Черная рамка`);
            }else if(border === 'white'){
                $(`.dropdown.border-select button`).html(`Белая рамка`);
            }else{
                $(`.dropdown.border-select button`).html(`Без рамки`);
            }

            $(`.crop-container.enabled`).attr('data-border', border);
            $('.border-frame').css('border', `3px solid ${border}`);
        }
    }

    /*Pagination*/
    goToPage(page) {
        this.paginator.set('current', page);
        $('#pagination-bar').html(this.paginator.render());
        let pagination = this.paginator.getPaginationData();

        //get items from current page
        let visible = this.props.urls.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
            return `#${item.uid}`
        });

        //hide all items
        $('.image-container').hide();
        //change size for items
        this.changePhotoSize($(`.crop-container.enabled`), this.size);
        if (this.framing !== 'whole') {
            $(visible.join(',')).show().find('.crop-container.enabled').find('img').css({
                'width': 'auto',
                'height': 'auto'
            })
        }
        //show items from current page and update cropper
        $(visible.join(',')).show().find('.crop-container.enabled').cropper('update', {fitToContainer: this.framing === 'whole'});

        //reset unchecked items
        $(visible.join(',')).find('.crop-container:not(.enabled)').css({
            width: '100%',
            height: '100%'
        }).cropper('reset');
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




        let html = <div id="cropper-container">
            <div className="spinner-container" id="loader" style="display: none">
                <div className="spinner"></div>
            </div>

            <div id="toolbar">
                <ToolbarComponent ref={this.child}
                                  sizes={this.props.sizes}
                                  progress={this.progress}
                                  waiting={this.state.waiting}
                                  onSelectChange={(state) => this.onSelectAllItems(state)}
                                  onDeleteAllClick={() => this.deleteAllItems()}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPaperChange={(val) => this.onPaperChange.call(this, val)}
                                  onFramingChange={val => this.onFramingChange.call(this, val)}
                                  onBorderChange={(val) => this.onBorderChange.call(this, val)}
                                  onOrderClick={(val) => this.onOrderClick()}
                />
            </div>
            <div id="main-section" style={{'max-height': this.props.options.maxHeight+'px'}}>
                <div className="placeholder">Фотографии не загружены</div>
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

        $(document).on('click', '.image-container .copy-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            this.cloneItem(uid);
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
