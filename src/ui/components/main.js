import {h, Component} from "preact";
import {ToolbarComponent} from "./toolbar";
import {ImageItem} from "./item";

const dot = require('dot');
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import {Scrollbars} from 'react-custom-scrollbars';
import Scrollbar from "smooth-scrollbar";


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


    onSelectAllItems(checked) {
        if (checked) {
            $('.image-container .crop-container').addClass('enabled');
            this.changePhotoSize($(`.crop-container.enabled`), this.size);
            $(`.crop-container.enabled`).cropper('update', {fitToContainer: this.framing === 'whole'});
        } else {
            $(`.crop-container.enabled`).css({width: '100%', height: '100%'}).cropper('reset');
            $('.image-container .crop-container').removeClass('enabled');

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
        } else {
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

    }

    onOrderClick() {
        let items = [];
        $('#cropper-container .image-item > div.enabled').each((i, e) => {
           // console.log(e);
            let left = 100 * Math.abs(parseFloat($(e).find('img').css('left'))) / parseFloat($(e).find('img').css('width')) | 0;
            let top = 100 * Math.abs(parseFloat($(e).find('img').css('top'))) / parseFloat($(e).find('img').css('height')) | 0;
            let cropX = 100 * (parseFloat($(e).css('width')) + left) / parseFloat($(e).find('img').css('width'));
            let cropY = 100 * (parseFloat($(e).css('height')) + top) / parseFloat($(e).find('img').css('height'));
            console.log({
                offsetX: left + "%",
                offsetY: top + "%",
                cropX: cropX + "%",
                cropY: cropY + "%",
            });
                items.push({
                    url: $(e).attr('data-src'),
                    crop: $(e).attr('data-crop') === 'true' ? {x: left, y: top, w: cropX, h: cropY} : false,
                    size:this.size
                });
        });
        this.props.onOrderClick(items);
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

        $('#main-section').html(items);


        $('#main-section').find(`.crop-container`).cropper({
            createUI: false,
            fitToContainer: true,
            left: -10,
            top: -30,
            initialZoom: 2,
            onLoad:(uid, width, height) => {
                console.log('onLoad  ' +width +" - "+ height);
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
            console.log(`onLoad  ${uid} = ` +width +" - "+ height);
        });

        let html = <div id="cropper-container">

            <div id="toolbar">
                <ToolbarComponent sizes={this.props.sizes}
                                  onSelectChange={(state) => this.onSelectAllItems(state)}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPaperChange={(val) => console.log(val)}
                                  onFramingChange={val => this.onFramingChange.call(this, val)}
                                  onBorderChange={(val) => console.log(val)}
                                  onOrderClick={(val) => this.onOrderClick()}
                />
            </div>
            <div id="main-section"></div>
            <div id="tippy-content-1" style="display: none;">
                <strong>Фото нестандартного формата.</strong>
                <div>Эта область обрежется при печати.</div>
            </div>
            <div id="tippy-content-2" style="display: none;">
                <strong>Фото нестандартного формата.</strong>
                <div>Останутся белые поля.</div>
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
            Scrollbar.init(document.querySelector('#main-section'))
        }, 1000);
        // const ps = new PerfectScrollbar('#main-section');

    }
}
