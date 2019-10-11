import {h, Component} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItem} from "./item";

const dot = require('dot');
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import {Scrollbars} from 'react-custom-scrollbars';
import Scrollbar from "smooth-scrollbar";
import pagination from 'pagination';
import axios from 'axios';

export class MainComponent extends Component {


    constructor() {
        super();

        this.state = {
            width: '100%',
            height: '100%',
            urls: [],
            checkAll: false,
            framing: 'whole'
        };
        this.framing = 'whole';
        this.size = {width: 15, height: 10};

        this.imageItemTemplate = new ImageItem().getHtml();

        
    }

    goToPage(page) {
        this.paginator.set('current', page);
        $('#pagination-bar').html(this.paginator.render());
    }


    onFormatChange(size) {
        this.size = {width: size[1], height: size[0]};
        this.changePhotoSize($(`.crop-container.enabled`), this.size);
        setTimeout(() => {
            if (this.framing === 'cropp') {
                $(`.crop-container.enabled`).cropper('update', {fitToContainer: false});
            } else {
                $(`.crop-container.enabled`).cropper('update', {fitToContainer: true});
            }
        }, 100);
    };

    onFramingChange(framing) {

        this.framing = framing;

        if (this.framing === 'cropp') {
            $(`.crop-container.enabled`).cropper('update', {fitToContainer: false});
        } else {
            $(`.crop-container.enabled`).cropper('update', {fitToContainer: true});
        }

    }

    onBorderChange(border) {
        if (border === 'none') {
            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none').css('z-index',0);
            $(`.crop-container.enabled`).attr('data-border', 'none');
        } else {
            //$(`.crop-container.enabled`).css('border', `3px solid ${border}`);
            $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${border}`).css('z-index', 99);
            $(`.crop-container.enabled`).attr('data-border', border);
        }
    }


    onSelectAllItems(checked) {
        if (checked) {

            setTimeout(()=>{
                $('.image-container .crop-container').addClass('enabled');
                this.changePhotoSize($(`.crop-container.enabled`), this.size);
                $(`.crop-container.enabled`).cropper('update', {fitToContainer: this.framing === 'whole'});
                $(`.crop-container.enabled`).find('.border-frame').css('border', `3px solid ${$(`.crop-container.enabled`).attr('data-border')}`);
            }, 100);

        } else {
            setTimeout(()=>{
                $(`.crop-container.enabled`).css({width: '100%', height: '100%'}).cropper('reset');
                $('.image-container .crop-container').removeClass('enabled');
            }, 100);

            $(`.crop-container.enabled`).find('.border-frame').css('border', 'none');
        }

        $('.image-container input[type=checkbox]').prop('checked', checked);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
    }

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
            if(target.attr('data-border') !== 'none'){
                target.find('.border-frame').css('z-index',99);
            }else{
                target.find('.border-frame').css('z-index',0);
            }
        } else {
            target.find('.border-frame').css('border', 'none').css('z-index',0);
            target.cropper('reset');
            target.removeClass('enabled');
        }

        $('#cropper-toolbar input[type=checkbox]').prop('checked', checkAll);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
    }

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

    removeItem(uid) {
        const index = this.props.urls.findIndex(a => a.uid === uid);
        if (index === -1) return;
        this.props.urls.splice(index, 1);
        $(`#crop-container-${uid}`).cropper('destroy');
        $(`#crop-container-${uid}`).closest('.image-container').remove();
        this.paginator.set('totalResult', this.props.urls.length);
        $('#pagination-bar').html(this.paginator.render());
        if(this.props.urls.length === 0){
            $('#main-section .placeholder').show();
        }
    }

    rotateImage(uid, deg){
        let index = this.props.urls.findIndex(a => a.uid === uid);
        $(`#crop-container-${uid}`).append('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
        axios.post(`${this.props.handlerUrl}/rotate`, {
            url: this.props.urls[index].thumbnail || this.props.urls[index].url,
            uid: uid,
            deg: deg || 90,
            dest: this.props.dest
        }).then(response => {
            console.log(response.data);
            let target =  $(`#crop-container-${uid}`);
            target.attr('data-rotate', response.data.deg >= 360 ? 0 : response.data.deg);
            target.html('');
            target.attr('data-src', `${response.data.filename}?v=${new Date().getTime()}`);
            target.cropper('update');
        }).catch(error => {
            $(`#crop-container-${uid} .lds-ring`).remove();
            console.log(error);
        })
    }

    onOrderClick() {
        let items = [];
        console.log(this.props.handlerUrl);
        $('#cropper-container .image-item > div.enabled').each((i, e) => {
            // console.log(e);
            let left = 100 * Math.abs(parseFloat($(e).find('img').css('left'))) / parseFloat($(e).find('img').css('width')) | 0;
            let top = 100 * Math.abs(parseFloat($(e).find('img').css('top'))) / parseFloat($(e).find('img').css('height')) | 0;
            let cropX = 100 * (parseFloat($(e).css('width')) + left) / parseFloat($(e).find('img').css('width'));
            let cropY = 100 * (parseFloat($(e).css('height')) + top) / parseFloat($(e).find('img').css('height'));

            let index = this.props.urls.findIndex(a => a.uid === $(e).attr('data-uid'));

            let item = {
                url: this.props.urls[index].url,
                crop: $(e).attr('data-crop') === 'true' ? {x: left, y: top, w: cropX, h: cropY} : false,
                size: this.size,
                dest: this.props.dest,
                rotate: $(e).attr('data-rotate') || 0,
                border: $(e).attr('data-border')
            };
            items.push(item);

            axios.post(`${this.props.handlerUrl}/processing`, item).then(response => {
                console.log(response.data);
            }).catch(error => {
                console.log(error);
            })

        });
        this.props.onOrderClick(items);
    }

    onPhotoAdded() {
        if(this.props.urls.length === 1){
            $('#main-section .placeholder').hide();
        }

        this.paginator.set('totalResult', this.props.urls.length);
         $('#pagination-bar').html(this.paginator.render());

        let pagination = this.paginator.getPaginationData();
        if(pagination.current === 1){
          
            let hidden = this.props.urls.slice(this.props.itemsPerPage).map((item, i) => {
               return `#crop-container-${item.uid}`
            });
            console.log(hidden);
            $(hidden.join(',')).hide();
        }
        console.log(this.paginator.getPaginationData());
    }

    generatePagination(){
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

            <div id="toolbar">
                <ToolbarComponent sizes={this.props.sizes}
                                  onSelectChange={(state) => this.onSelectAllItems(state)}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPaperChange={(val) => console.log(val)}
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
                <div>Советуем заменить на фото с высоким разрешением(минимум min).</div>
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
        // const ps = new PerfectScrollbar('#main-section');

        this.generatePagination();

        $(document).on('click', '.pagination .page-link', (e) => {
            this.goToPage($(e.target).attr('data-page'));
            e.preventDefault();
        });

        $('#pagination-bar').html(this.paginator.render());
        
    }
    
    
}
