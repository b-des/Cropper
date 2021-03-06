import {h, Component, createRef} from "preact";
import {ToolbarComponent} from "./toolbar";
import {BorderComponent} from "./border-popup";
import {ImageItem} from "./item";
import uuid from 'uuid/v4';
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import pagination from 'pagination';
import axios from 'axios';
import Swal from 'sweetalert2';

const dot = require('dot');

export class MainComponent extends Component {

    constructor() {
        super();
        this.state = {
            width: '100%',
            height: '100%',
            checkAll: false,
            framing: 'whole',
            waiting: false,
            progress: false,
            openBorderModal: false
        };
        this.framing = 'whole';
        this.size = {width: 0, height: 0};
        this.progress = 0;
        this.imageItemTemplate = new ImageItem().getHtml();
        this.options = [];
        this.child = createRef();
        this.initializedPages = [];
        this.borderSettings = new BorderComponent();
        this.individualOptions = [];
        window.photos = [];
    }

    /*Fire when changed size*/
    onFormatChange(size, element, index) {
        this.changePhotoSize(element || $(`.crop-container.enabled`), {width: size[1], height: size[0]});
        // if update single element
        if (index >= 0) {
            element.cropper('update', {fitToContainer: !window.photos[index].crop});
        } else {
            this.size = {width: +size[1], height: +size[0]};
            let target = element || $(`.image-container:visible .crop-container.enabled`);
            target.cropper('update', {fitToContainer: this.framing !== 'cropp'});
        }
        this.adjustOrientation(true);
        setTimeout(() => {
            this.checkResolutionOfPhotos();
        }, 1000);

        if (!element) {
            window.photos.map(item => {
                item.size = this.size;
                return item;
            });
        }
    };

    /*Fired on paper change*/
    onPaperChange(paper) {
        this.paper = paper;
        window.photos.map(item => {
            item.paper = paper;
            return item;
        });
    }

    /*Fire when change cropping mode*/
    onFramingChange(framing, element) {
        if (!element) {
            this.framing = framing;
            $(`.crop-container.enabled`).each((i, obj) => {
                setTimeout(() => {
                    $(obj).cropper('update', {fitToContainer: this.framing !== 'cropp'})
                }, 10)
            });
            window.photos.map(item => {
                item.crop = this.framing === 'cropp';
                return item;
            });
        }
        element = element || $(`.image-container:visible .crop-container.enabled`);
        element.cropper('update', {fitToContainer: framing !== 'cropp'});
    }

    /*On change photo border*/
    onBorderChange(border, itemIndex) {
        if (!itemIndex) {
            this.border = border;
        }
        window.photos.map(item => {
            item.border = border;
            return item;
        });
        let element = itemIndex >= 0 ? $(`#crop-container-${window.photos[itemIndex].uid}`) : $(`.image-container .crop-container.enabled`);
        if (border === 'none') {
            element.find('.border-frame').css('border', 'none').css('z-index', '-1');
            element.attr('data-border', 'none');
            element.attr('data-border-thickness', 0);
            element.css('padding', 0);
            window.photos.map(item => {
                item.borderThickness = 0;
                return item;
            });
        } else {
            let thickness = this.props.options.borderWidth / window.MM_KOEF;
            element.find('.border-frame').css('border', `${thickness}px solid ${border}`).css('z-index', 99);
            element.attr('data-border', border);
            element.attr('data-border-thickness', this.props.options.borderWidth);
            element.css('padding', thickness);
        }


        $(`.image-container:visible .crop-container.enabled`).cropper('update');
        //$(`.crop-container.enabled`).cropper('update');
    }

    /*Select/unselect all photos*/
    onSelectAllItems(checked) {
        let pagination = this.paginator.getPaginationData();

        let visibleItems = window.photos.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
            return `#${item.uid}`
        });

        let totalItems = $(`.crop-container`).length;
        let k = 100 / totalItems;

        if (checked) {
            $('.image-container .crop-container').addClass('enabled');
            setTimeout(() => {
                this.changePhotoSize($(`.crop-container.enabled`), this.size);

                let thickness = this.props.options.borderWidth / window.MM_KOEF;
                if ($(`.crop-container.enabled`).attr('data-border'))
                    $(`.crop-container.enabled`).find('.border-frame').css('border', `${thickness}px solid ${$(`.crop-container.enabled`).attr('data-border')}`);
                if (this.border)
                    $(`.crop-container.enabled`).find('.border-frame').css('border', `${thickness}px solid ${this.border}`).css('z-index', 1);

                if (this.border && this.border !== 'none') {
                    $(`.crop-container.enabled`).attr('data-border', this.border).css('padding', thickness);
                    $(`.crop-container.enabled`).attr('data-border-thickness', this.props.options.borderWidth);
                }
                $(visibleItems.join(',')).find('.crop-container').cropper('update', {fitToContainer: this.framing === 'whole'});
            }, 10);
            this.child.current.removeControlTooltip();
        } else {
            $('.image-container .crop-container').removeClass('enabled');


            $(`.crop-container`).find('.border-frame').css('border', 'none').css('z-index', -1);
            $(`.crop-container`).css('padding', 0);
            this.child.current.addControlTooltip();
            $(visibleItems.join(',')).find('.crop-container').css({
                width: '100%',
                height: '100%'
            }).cropper('reset');
        }

        $('.image-container input[type=checkbox]').prop('checked', checked);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
        this.onOptionChange();
    }

    /*Select/unselect single item*/
    onItemSelect(uid, checked, skipOptionChangeEvent) {
        let checkAll = false;
        let target = $(`#crop-container-${uid}`);
        const index = window.photos.findIndex(a => a.uid === uid);
        const border = window.photos[index]['border-select'] && window.photos[index]['border-select'].trim();
        $('.image-container input[type=checkbox]').each(function () {
            if ($(this).prop('checked')) {
                checkAll = true;
            }
        });

        if (checked) {
            let size = window.photos[index].size;
            // if size has string format
            if (typeof window.photos[index].size === "string") {
                let chunks = window.photos[index].size.split(',');
                size = {
                    width: chunks[1],
                    height: chunks[0]
                }
            }
            // if size has array format
            if (size && size.length === 2) {
                size = {
                    width: size[1],
                    height: size[0]
                }
            }
            target.addClass('enabled');
            this.changePhotoSize(target, size);


            if (border && border !== 'none' && !+target.attr('data-border-thickness')) {
                target.attr('data-border-thickness', this.props.options.borderWidth);
                target.attr('data-border', window.photos[index].border);
            }
            let thickness = target.attr('data-border-thickness') / window.MM_KOEF;
            if (border) {
                target.find('.border-frame').css('border', `${thickness}px solid ${target.attr('data-border')}`).css('z-index', '1');
                target.css('padding', thickness);
            } else {
                target.find('.border-frame').css('z-index', '-1');
            }
            target.cropper('update', {fitToContainer: !window.photos[index].crop});
        } else {
            target.css('padding', 0);
            target.find('.border-frame').css('border', 'none').css('z-index', '-1');
            target.cropper('reset');
            target.removeClass('enabled');
        }

        if (checkAll) {
            this.child.current.removeControlTooltip();
        } else {
            this.child.current.addControlTooltip();
        }

        $('#cropper-toolbar input[type=checkbox]').prop('checked', checkAll);
        $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
        if (!skipOptionChangeEvent)
            this.onOptionChange();
    }

    /*Calculate sizes for photo*/
    changePhotoSize(container, size) {


        let photo = window.photos.filter(item => item.uid === container.attr('data-uid'))[0];
        let resolution = photo && photo.resolution ? photo.resolution.split('x') : null;

        let containerSize = {width: 280, height: 180};
        if (size && (size.width !== 0 && size.height !== 0)) {

            if (size.width === size.height) {
                container.css({width: '180px', height: '180px'});
            } else {
                let ratio = size.width / size.height;
                if (ratio >= containerSize.width / containerSize.height) {
                    //280/size[1]:180/x
                    let height = containerSize.width / size.width * size.height;
                    container.css({width: '280px', height: `${height}px`});
                } else {
                    let width = containerSize.height / size.height * size.width;
                    container.css({width: `${width}px`, height: '180px'});
                }

            }
            this.size = {width: +size.width, height: +size.height};
            if (resolution && (+resolution[0] / +resolution[1] < 1)) {
                if (this.size.width < this.size.height && container.attr('data-rotate') === '-90') {
                    // setTimeout(this.rotateImage.bind(this, photo.uid, 0), 1000);
                } else if (this.size.width > this.size.height && +container.attr('data-rotate') === 0) {
                    // setTimeout(this.rotateImage.bind(this, photo.uid, -90), 1000);
                }
            }
        } else {
            container.css({width: `${containerSize.width}px`, height: `${containerSize.height}px`});
        }

    }

    /*Clone image*/
    cloneItem(uid) {
        const index = window.photos.findIndex(a => a.uid === uid);
        let photo = window.photos[index];
        let item = JSON.parse(JSON.stringify(photo));
        item.uid = uuid();
        //window.photos.push(item);
        item.clone = true;
        item.quantity = 1;
        window.photos.splice(index, 0, item);
        let options = {
            url: photo.thumbnail || photo.url,
            top: photo.top === 0 ? 0 : photo.top || '',
            left: photo.left === 0 ? 0 : photo.left || '',
            zoom: photo.zoom || 0,
            uid: item.uid,
            quantity: 1,
            border: photo.border || '',
            rotate: photo.rotate || '',
            checked: true,
            borderThickness: 0,
            options: this.props.options.options,
            selectedOptions: photo.options
        };

        let html = dot.template(this.imageItemTemplate)(options);

        $(html).insertAfter(`#${uid}`);
        $(`#${item.uid}`).find('.crop-container').cropper({
            onLoad: () => {
                this.adjustOrientation(true, item.uid)
            }, createUI: false, fitToContainer: photo.crop
        });
        this.paginator.set('totalResult', window.photos.length);
        $('#pagination-bar').html(this.paginator.render());
        tippy('[data-tippy-content]', {'theme': 'light'});
        this.onItemSelect(item.uid, true);

        Object.keys(photo.options).map((key, index) => {
            this.excludeUnsuitableOptions(null, null, photo.options[key].option_id, photo.options[key].option_value_id);
        });

        /* let currentDegree = parseInt($(`#${item.uid}`).find('.crop-container').attr('data-rotate'));
         let deg = currentDegree ? currentDegree + 90 : 90;
         this.rotateImage(item.uid, deg > 360 ? 90 : deg);*/
        //this.registerListeners();
    }

    /*Delete item*/
    removeItem(uid) {

        let confirmedRemove = () => {
            const index = window.photos.findIndex(a => a.uid === uid);
            if (index === -1) return;
            let params = window.photos[index].params;
            window.photos.splice(index, 1);
            $(`#crop-container-${uid}`).cropper('destroy');
            $(`#crop-container-${uid}`).closest('.image-container').remove();
            this.paginator.set('totalResult', window.photos.length);
            $('#pagination-bar').html(this.paginator.render());
            if (window.photos.length === 0) {
                $('#main-section .placeholder').show();
            }

            let pagination = this.paginator.getPaginationData();

            let visible = window.photos.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
                return `#${item.uid}`
            });


            $('.image-container').hide();
            $(visible.join(',')).show();
            if (pagination.totalResult >= this.props.options.itemsPerPage) {
                let newItemOnPage = window.photos[pagination.toResult - 1];
                this.initPhotos(newItemOnPage);
                $(`#${newItemOnPage.uid} .crop-container`).cropper('update', {fitToContainer: this.framing !== 'cropp'});
                this.checkResolutionOfPhotos(newItemOnPage);
            }

            $('#cropper-toolbar .selected-items').html($('.image-container input[type=checkbox]:checked').length);
            this.onOptionChange(null, null, null, params);
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
    deleteAllItems(forced) {
        let confirmedRemove = () => {
            //window.photos = [];
            $('.image-container').remove();
            this.paginator.set('totalResult', window.photos.length);
            $('#pagination-bar').html(this.paginator.render());
            $('.placeholder').show();
            $('#cropper-toolbar input[type=checkbox]').prop('checked', false);
            $('#cropper-toolbar .selected-items').html(0);

            this.initializedPages = [];
            this.options = [];
            this.props.options.options.map(option => {
                $(`[data-option-id=${option.option_id}]`).find('button').html(option.name)
            });
            $(`#cropper-toolbar .dropdown a`).removeClass('disabled');
            this.framing = 'whole';
            this.size = {width: 0, height: 0};
            this.border = null;

        };
        if (!forced) {
            Swal.fire({
                title: 'Вы уверены?',
                text: 'Удалить все фото?',
                type: 'question',
                showCancelButton: true,
                cancelButtonText: 'Отмена',
                confirmButtonText: 'Удалить'
            }).then(res => {
                if (res.value) {
                    this.props.clear();
                    this.props.onDeleteAllPhotos(true);
                    window.photos = [];
                }
            })
        } else {
            confirmedRemove();
        }

    }

    /*Rotate image*/
    rotateImage(uid, deg) {
        let index = window.photos.findIndex(a => a.uid === uid);
        let photo = null;
        if (index === -1)
            photo = window.photos.filter(item => item.uid === uid)[0];
        $(`#crop-container-${uid}`).append('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
        axios.post(`${this.props.handlerUrl}/rotate`, {
            url: window.photos[index] ? window.photos[index].thumbnail || window.photos[index].url : photo.thumbnail || photo.url,
            uid: uid,
            deg: deg,
            dest: this.props.dest
        }).then(response => {

            setTimeout(() => {
                let target = $(`#crop-container-${uid}`);
                target.attr('data-rotate', response.data.deg >= 360 ? 0 : response.data.deg);
                target.html('');
                target.attr('data-src', `${response.data.filename}?v=${new Date().getTime()}`);
                // target.cropper('reset');
                target.cropper('update', {
                    rotate: true, createUI: target.hasClass('enabled'), onLoad: () => {
                        this.onItemSelect(uid, true);
                    }
                });

                if (this.border && this.border !== 'none') {
                    target.find('.border-frame').css('z-index', `99`);
                }

            }, 1000);

        }).catch(error => {
            $(`#crop-container-${uid} .lds-ring`).remove();
        })
    }

    getAllPhotos() {
        let items = [];
        $('#cropper-container .image-item > div.enabled').each((i, e) => {
            let photo = window.photos.filter(item => item.uid === $(e).attr('data-uid'))[0];
            let size = photo.size;
            if (Array.isArray(size)) {
                size = {width: photo.size[1], height: photo.size[0]};
            } else if (photo.size && !photo.size.width) {
                let chunks = photo.size.split(',');
                size = {width: chunks[1], height: chunks[0]};
            }

            let item = {
                url: photo.url,
                thumbnail: photo.thumbnail || photo.url,
                resolution: photo.resolution,
                size: size,
                dest: this.props.dest,
                paper: photo.paper || '',
                crop: false,
                original: true,
                options: photo.options,
                quantity: parseInt($(e).closest('.image-container').find('[name="quantity"]').val()) || parseInt($('[name="quantity"]').val())
            };

            if ($(e).hasClass('enabled')) {

                let imgWidth = (parseFloat($(e).find('img').css('width')));
                let imgHeight = (parseFloat($(e).find('img').css('height')));
                let offset = parseInt($(e).attr('data-border-thickness'));

                //let left = (parseFloat($(e).find('img').css('width')) );
                let left = 100 * ((Math.abs(parseFloat($(e).find('img').css('left')))) / imgWidth) || 0;
                //let top = (parseFloat($(e).find('img').css('height')));
                let top = 100 * ((Math.abs(parseFloat($(e).find('img').css('top'))) / imgHeight)) || 0;

                let width = 100 * (($(e).innerWidth() - offset * 2) / imgWidth);

                let height = 100 * (($(e).innerHeight() - offset * 2) / imgHeight);


                item = Object.assign(item, {
                    crop: ($(e).attr('data-crop') === 'true' || this.framing === 'cropp') && photo.crop ? {
                        x: isFinite(left) ? left : 0,
                        y: isFinite(top) ? top : 0,
                        w: isFinite(width) ? width : 0,
                        h: isFinite(height) ? height : 0
                    } : false,
                    rotate: $(e).attr('data-rotate') || 0,
                    border: $(e).attr('data-border') || '',
                    borderThickness: $(e).attr('data-border-thickness') || 0,
                    zoom: $(e).attr('data-zoom'),
                    original: false
                });


                if (photo.crop && (item.crop.w === 0 || item.crop.h === 0)) {
                    item.crop = photo.crop;
                }
                // is user hasn't changed photo position
                // use auto cropping at center
                if (!parseInt($(e).attr('data-left')) && !parseInt($(e).attr('data-top')) && photo.crop) {
                    item.crop = true;
                }

            }
            if (!this.props.immediate) {
                item = Object.assign(item, {
                    top: (!item.crop.w && !item.crop.h) ? '' : parseFloat($(e).find('img').css('top')),
                    left: (!item.crop.w && !item.crop.h) ? '' : parseFloat($(e).find('img').css('left')),
                    params: photo ? photo.params : ''
                });
            }

            if (photo.clone) {
                if (!item.params) {
                    item.params = {};
                }
                item.params.clone = true;
            }

            items.push(item);
        });

        return items;
    }

    /*Fire when clicked ORDER button*/
    makeOrder(optionChanged, extra) {
        let optionsKey = this.props.options.options.map(option => option.option_id);
        let haveUnselectedOptions =
            window.photos
                //.filter(item => Object.keys(item.options).length !== this.props.options.options.length)
                .map(item => {
                    return optionsKey.map(key => {
                        if (!Object.keys(item.options).includes(key)) {
                            $(`#${item.uid} [data-option-id='${key}']`).find('button').addClass('btn-danger');
                            return key;
                        }
                    }).filter(item => item);
                }).filter(item => Array.isArray(item) && item.length);
        if (haveUnselectedOptions.length > 0 && !optionChanged) {
            Swal.fire({
                text: 'Для всех или некоторых фотографий не указаны опции печати'
            });
            return;
        }

        if ($('#cropper-container .image-item > div').length === 0 && !optionChanged) {
            Swal.fire({
                text: 'Вы не загрузили ни одной фотографии!'
            });
            return;
        }

        let items = this.getAllPhotos();

        if (this.props.immediate && !optionChanged) {
            this.props.onProcessingStart({status: 'start', count: items.length});

            axios.post(`${this.props.handlerUrl}/processing`, {data: items}, {timeout: 600000}).then(response => {
                if (this.props.onOrder)
                    this.props.onOrder({options: this.options, photos: response.data});
            }).catch(error => {
                if (this.props.onOrder)
                    this.props.onOrder(error);
            });
        } else {

            if (optionChanged) {
                this.props.onOptionChanged({
                    options: this.options,
                    photos: items.reverse(),
                    params: extra,
                    persons: this.individualOptions
                });
            } else {
                this.props.onOrder({options: this.options, photos: items.reverse(), persons: this.individualOptions});
            }
        }
    }

    /*Initializing photo at first start*/
    initPhotos(photo) {
        if ($('#main-section').find(`#crop-container-${photo.uid}`).find('.lds-ring').length == 0)
            return false;
        let container = $('#main-section').find(`#crop-container-${photo.uid}`);
        if (this.border && this.border !== 'none') {
            let thickness = this.props.options.borderWidth / window.MM_KOEF;
            container.find('.border-frame').css('border', `${thickness}px solid ${this.border}`).css('z-index', 99);
            container.attr('data-border', this.border);
            container.attr('data-border-thickness', this.props.options.borderWidth);
            container.css('padding', thickness);
        }

        container.cropper({
            createUI: photo.original === false,
            fitToContainer: !photo.crop || photo.crop === false,
            onLoad: (uid, width, height, existItem) => {
            }
        });

        if (container.attr('data-rotate') && +container.attr('data-rotate') !== 0) {
            setTimeout(this.rotateImage.bind(this, photo.uid, container.attr('data-rotate')), 1000);
            photo.oldRotation = +container.attr('data-rotate');
        }
    }

    /*Check if photo is bigger than current format size*/
    checkResolutionOfPhotos(photo) {
        if (!photo && this.size.width) {
            let pagination = this.paginator.getPaginationData();
            window.photos.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
                this.calculateFitSize(item);
            });
        } else if (this.size.width) {
            this.calculateFitSize(photo);
        }

    }

    calculateFitSize(item) {
        if (item.resolution) {
            let resolution = item.resolution.split('x');
            if (this.size.width * 2.835 > +resolution[0] || this.size.height * 2.835 > +resolution[1]) {
                let warning = $(`#crop-container-${item.uid}`).closest('.image-container').find('.warning').css('display', 'block');
                let content = document.getElementById('tippy-content-3').innerHTML
                    .replace('current', `${resolution[0]}x${resolution[1]}`)
                    .replace('min', `${Math.ceil(this.size.width * 2.835)}x${Math.ceil(this.size.height * 2.835)}`);

                warning.attr('data-tippy-content', this.size.width * 2.835);
                if (!warning.get(0)._tippy) {
                    tippy(warning.get(0), {theme: 'light'}).setContent(content);
                } else {
                    warning.get(0)._tippy.setContent(content);
                }
            } else {
                $(`#crop-container-${item.uid}`).closest('.image-container').find('.warning').css('display', 'none');
            }
        }
    }

    /*Fire when add photo*/
    onPhotoAdded() {
        $('#main-section .placeholder').hide();
        this.paginator.set('totalResult', window.photos.length);
        $('#pagination-bar').html(this.paginator.render());

        let pagination = this.paginator.getPaginationData();
        if (pagination.current === 1) {

            let hidden = window.photos.slice(this.props.itemsPerPage).map((item, i) => {
                return `#${item.uid}`
            });

            $(hidden.join(',')).hide();
        } else {
            let visible = window.photos.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {
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
        if (length) {
            $('#cropper-toolbar input[type=checkbox]').prop('checked', 'checked');
            this.child.current.removeControlTooltip();
        }
        this.adjustOrientation();
        setTimeout(() => {
            let index = this.initializedPages.indexOf(1);
            this.initializedPages[index] = 0;
            this.goToPage(1);
        }, 500);
        this.refreshOptionsTooltips();
    }

    updateSizes(sizes) {
        this.props.sizes = sizes;
    }

    /*Pagination*/
    goToPage(page) {
        this.paginator.set('current', page);
        $('#pagination-bar').html(this.paginator.render());
        let pagination = this.paginator.getPaginationData();

        //hide all items
        $('.image-container').hide();

        //get items from current page
        let visible = window.photos.slice(pagination.fromResult - 1, pagination.toResult).map((item, i) => {

            if (!item.initialized) {
                Object.keys(item.options).map((key, index) => {
                    this.excludeUnsuitableOptions(null, null, item.options[key].option_id, item.options[key].option_value_id);
                });
                if (this.props.options.itemsPerPage === i + 1) {
                    this.initializedPages.push(+page);
                }
                item.initialized = true;
                this.initPhotos(item);
            } else if (item.oldRotation !== item.rotation) {
                setTimeout(this.rotateImage.bind(this, item.uid, item.rotation), 500);
                item.oldRotation = item.rotation;
            }


            this.checkResolutionOfPhotos(item);

            let element = $(`#crop-container-${item.uid}`);
            //change size for items
            this.changePhotoSize(element, item.size || null);
            if (item.crop) {
                $(`#${item.uid}`).show().find('.crop-container.enabled').find('img').css({
                    'width': 'auto',
                    'height': 'auto'
                })
            }

            $(`#${item.uid}`).show().find('.crop-container.enabled').cropper('update', {fitToContainer: !item.crop});

            return `#${item.uid}`
        });


        //$(visible.join(',')).show().find('.crop-container.enabled').cropper('update');

        //reset unchecked items
        $(visible.join(',')).find('.crop-container:not(.enabled)').css({
            width: '100%',
            height: '100%'
        }).cropper('reset');


    }

    /*Create pagination instance*/
    generatePagination() {
        this.paginator = new pagination.TemplatePaginator({
            prelink: '', current: 1,
            rowsPerPage: this.props.itemsPerPage,
            pageLinks: 4,
            last: 100,
            totalResult: window.photos.length,
            slashSeparator: true,
            template: function (result) {
                let i, len, prelink;
                let html = '<div><ul class="pagination">';
                if (result.pageCount < 2) {
                    html += '</ul></div>';
                    return '';
                }
                if (result.previous) {
                    html += '<li class="page-item"><button class="page-link" data-page="1">&#8249;&#8249;</button></li>';
                    html += '<li class="page-item"><button class="page-link" data-page="' + result.previous + '">&#8249;</button></li>';
                }
                if (result.range.length) {
                    for (i = 0, len = result.range.length; i < len; i++) {
                        if (result.range[i] === result.current) {
                            html += '<li class="active page-item"><button class="page-link"   data-page="' + result.range[i] + '">' + result.range[i] + '</button></li>';
                        } else {
                            html += '<li class="page-item"><button class="page-link"   data-page="' + result.range[i] + '">' + result.range[i] + '</button></li>';
                        }
                    }
                }

                if (result.pageCount > 4 && result.current < result.pageCount - 1) {
                    html += '<li class="page-item disabled"><span class="page-link" >...</span></li>';
                    html += '<li class="page-item"><button class="page-link"  data-page="' + result.pageCount + '" class="paginator-next">' + result.pageCount + '</button></li>';
                }

                if (result.next) {
                    html += '<li class="page-item"><button class="page-link"   data-page="' + result.next + '" class="paginator-next">&#8250;</button></li>';
                    html += '<li class="page-item"><button class="page-link"   data-page="' + result.pageCount + '" class="paginator-next">&#8250;&#8250;</button></li>';
                }
                html += '</ul></div>';

                return result.previous || result.next ? html : '';
            }
        });
    }

    onOptionChange(id, value, data, deleted) {
        let name = '';
        let option = this.props.options.options.filter(item => +item.option_id === +id)[0];
        if (option && value) {
            name = option.option_values.filter(item => +item.option_value_id === +value)[0];
        }

        let individualOptions = [];
        window.photos.map(item => {

            if (data && value) {
                item[data.itemLabel] = data.optionLabel;
                item['options'][id] = {option_id: id, option_value_id: value, value_name: name};
            }else{
                if(data && data.optionLabel)
                    delete item[data.optionLabel];
                delete item.options[id];
            }
            individualOptions.push({
                options: Object.entries(item.options).map(option => option[1]),
                params: item.params,
                quantity: +item.quantity || 1
            });
            return item;
        });


        if (id && value) {
            let option = {
                option_id: +id,
                option_value_id: +value,
            };
            let index = this.options.findIndex((item) => item.option_id === +id);
            if (index === -1) {
                this.options.push(option)
            } else {
                this.options[index] = option;
            }
            // highlight individual option
            // when changed global options
            let element = $(`.dropdown[data-option-id="${id}"]`);
            element.find('.option').removeClass('active');
            element.find(`.option[data-option-value-id="${value}"]`).addClass('active');
        } else if (id && value === 0) {
            let index = this.options.findIndex((item) => item.option_id === +id);
            if (index > -1) {
                this.options.splice(index, 1);
            }
        }

        let quantity = 0;
        $('#main-section .crop-container.enabled').parent().parent().find('[name="quantity"]').each(function () {
            quantity += +$(this).val();
        });

        this.individualOptions = individualOptions;
        let result = {options: this.options, persons: individualOptions, photos: this.getAllPhotos()};
        if (deleted) {
            result.deleted = deleted;
        }

        if (this.props.onOptionChanged)
            this.props.onOptionChanged(result);
        if (id && value)
            this.excludeUnsuitableOptions(null, null, id, value);
    }

    adjustOrientation(rotateImmediate, uid) {
        if (rotateImmediate && this.paginator) {
            let pagination = this.paginator ? this.paginator.getPaginationData() : {
                fromResult: 0,
                toResult: window.photos.length
            };
            window.photos.slice(pagination.fromResult - 1, pagination.toResult)
                .filter(photo => uid ? photo.uid === uid : true)
                .map((photo, i) => {

                let resolution = photo.resolution ? photo.resolution.split('x') : null;
                let container = $('#main-section').find(`#crop-container-${photo.uid}`);

                if (resolution && (+resolution[0] / +resolution[1] < 1)) {
                    if (this.size.width < this.size.height && container.attr('data-rotate') === '-90') {
                        setTimeout(this.rotateImage.bind(this, photo.uid, 0), 500);
                        photo.oldRotation = 0;
                    } else if (this.size.width === 0 || (this.size.width > this.size.height && +container.attr('data-rotate') === 0)) {
                        setTimeout(this.rotateImage.bind(this, photo.uid, -90), 500);
                        photo.oldRotation = -90;
                    }
                }
            });
        }

        window.photos.map((photo, i) => {
            let resolution = photo.resolution ? photo.resolution.split('x') : null;
            let container = $('#main-section').find(`#crop-container-${photo.uid}`);
            if (resolution && (+resolution[0] / +resolution[1] < 1)) {
                if (this.size.width < this.size.height && container.attr('data-rotate') === '-90') {
                    container.attr('data-rotate', '0');
                    photo.rotation = 0;
                } else if (this.size.width === 0 || (this.size.width > this.size.height)) {
                    container.attr('data-rotate', '-90');
                    photo.rotation = -90;
                }
            }
        });
    }

    render(props, state, context) {

        let items = '';

        window.photos.map((item, key) => {
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
                                  options={this.props.options.options}
                                  defaultOptions={this.props.options.defaultOptions}
                                  onOptionChange={(id, value, extra) => this.onOptionChange.call(this, id, value, extra)}
                                  onSelectChange={(state) => this.onSelectAllItems(state)}
                                  onDeleteAllClick={() => this.deleteAllItems()}
                                  onSizeChange={size => this.onFormatChange.call(this, size)}
                                  onPaperChange={(val) => this.onPaperChange.call(this, val)}
                                  onFramingChange={val => this.onFramingChange.call(this, val)}
                                  onBorderChange={(val) => this.onBorderChange.call(this, val)}
                                  onOrderClick={(val) => this.makeOrder()}
                />
            </div>
            <div id="main-section" style={{'max-height': this.props.options.maxHeight + 'px'}}>
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

    registerListeners() {
        let listener = (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            let currentDegree = parseInt($(e.target).closest('.image-container').find('.crop-container').attr('data-rotate'));
            let deg = currentDegree ? currentDegree + 90 : 90;
            this.rotateImage(uid, deg > 360 ? 90 : deg);
        };
        setTimeout(() => {
            let rotate = document.querySelectorAll('.rotate-item');
            Array.from(rotate).forEach(link => {
                link.removeEventListener('click', listener, false);
                link.addEventListener('click', listener, false);
            });
        }, 100);
    }

    quantityChange(uid, quantity) {
        // get item position
        const index = window.photos.findIndex(a => a.uid === uid);
        window.photos[index]['quantity'] = quantity;
    }

    refreshOptionsTooltips(){
        $(function () {
            $('[data-toggle="option-tooltip"]').each(function () {
                let image = $(this).attr('data-image');
                let description = $(this).attr('data-description');
                let isMobile = window.innerWidth < 768;
                if (description || image) {
                    $(this).tooltip({
                        html: true,
                        boundary: 'window',
                        offset: 100,
                        placement: 'auto',
                        delay: { "show": isMobile ? 100 : 1200, "hide": 100 },
                        title: `<p>${description}</p>` + (image ? `<img class="img-thumbnail" style="width: 150px" width="150px" src="${image}"/>` : ''),
                    });
                }

                if(isMobile){
                    $(document).on('click', '#cropper-toolbar .dropdown-menu', function (e) {
                        e.stopPropagation();
                        setTimeout(() => {
                            $(document).click();
                        }, 500)
                    });
                }
            });
        });
    }

    componentDidMount() {

        window.photos = [];
        this.borderSettings.initPopup("cropper-container");

        $(document).on('click', '.image-container .remove-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            this.removeItem(uid);
        });

        $(document).off('click', '.image-container .copy-item').on('click', '.image-container .copy-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            this.cloneItem(uid);
        });

        $(document).on('click', '.image-container .rotate-item', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            let currentDegree = parseInt($(e.target).closest('.image-container').find('.crop-container').attr('data-rotate'));
            let deg = currentDegree ? currentDegree + 90 : 90;
            this.rotateImage(uid, deg > 360 ? 90 : deg);
        });

        $(document).on('click', '.image-container .border-adjust', (e) => {
            let uid = $(e.target).closest('.image-container').find('.crop-container').attr('data-uid');
            let border = $(e.target).closest('.image-container').find('.crop-container').attr('data-border');
            let enabled = $(e.target).closest('.image-container').find('.crop-container.enabled').length;

            if (!border || border === 'none' || !enabled) {
                Swal.fire({
                    text: 'Для управления рамкой, отметьте фотографию и выберите рамку'
                });
            } else {
                this.borderSettings.show(uid)
            }
        });

        $(document).on('change', '.image-container input[type=checkbox]', (e) => {
            this.onItemSelect($(e.target).closest('.image-container').attr('id'), $(e.target).prop('checked'));
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
        $(document).on('change', '.image-container [name="quantity"]', (e) => {
            let element = $(e.target).closest('.image-container').find('.crop-container');
            let uid = element.attr('data-uid');
            let quantity = $(e.target).closest('.image-container').find('[name="quantity"]').val();
            this.quantityChange(uid, quantity);
            this.onOptionChange();
        });

        setTimeout(() => {

        }, 1000);


        this.generatePagination();

        $(document).on('click', '.pagination .page-link', (e) => {
            this.goToPage($(e.target).attr('data-page'));
            e.preventDefault();
        });

        $('#pagination-bar').html(this.paginator.render());

        if (this.props.options.defaultOptions)
            this.props.options.defaultOptions.map(option => {
                this.onOptionChange(option.option_id, option.option_value_id);
            });


        $(document).keyup((e) => {
            if (e.originalEvent.key === 'ArrowLeft') {
                let pagination = this.paginator.getPaginationData();
                if (pagination.current > 1)
                    this.goToPage(pagination.current - 1);
            } else if (e.originalEvent.key === 'ArrowRight') {
                let pagination = this.paginator.getPaginationData();
                if (pagination.current < pagination.totalResult)
                    this.goToPage(pagination.current + 1);

            }
        });

        $(document).on('click', '.dropdown-menu a.dropdown-toggle', function (e) {
            if (!$(this).next().hasClass('show')) {
                $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
            }
            let $subMenu = $(this).next(".dropdown-menu");
            $subMenu.toggleClass('show');


            $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
                $('.dropdown-submenu .show').removeClass("show");
            });
            return false;
        });

        $(document).on('click', '.item-options .dropdown-item.option', (e) => {

            let element = $(e.target).closest('.image-container').find('.crop-container');
            let uid = element.attr('data-uid');
            let option = $(e.target).closest('.dropdown').attr('data-label');
            let optionId = $(e.target).closest('.dropdown').attr('data-option-id');
            let valueId = $(e.target).attr('data-option-value-id');
            let value = $(e.target).attr('data-value');
            if (!value) {
                value = $(e.target).attr('data-label');
            }

            if ($(`#${uid} .dropdown[data-option-id="${optionId}"] [data-option-value-id="${valueId}"]`)
                .hasClass('disabled')) {
                Swal.fire({
                    title: 'Конфликт опций1',
                    text: 'Опции будут сброшены. Вы согласны?',
                    type: 'question',
                    showCancelButton: true,
                    cancelButtonText: 'Отмена',
                    confirmButtonText: 'Продолжить'
                }).then(res => {
                    if (res.value) {
                        this.resetUnsuitableOptions(element, uid, optionId, valueId);
                        this.onSingleOptionChange(element, uid, option, value, optionId, valueId);
                    }
                });
                return false;
            }


            this.onSingleOptionChange(element, uid, option, value, optionId, valueId);
        });

    }

    onSingleOptionChange(element, uid, optionName, optionValue, optionId, valueId) {
        // make item checked
        this.onItemSelect(uid, true, true);
        $(`#${uid}`).find('input[type="checkbox"]').prop('checked', 'checked');
        $(`#${uid}`).find('.crop-container ').addClass('enabled');

        $(`#${uid}`).find('.dropdown-item').removeClass('active');
        $(`#${uid}`).find(`.dropdown[data-option-id="${optionId}"]`).find('button').removeClass('btn-danger');
        $(`#${uid}`).find(`.dropdown[data-option-id="${optionId}"] .dropdown-item[data-option-value-id="${valueId}"]`)
            .addClass('active');
        element.attr(`data-${optionName}`, optionValue);

        // get item position
        const index = window.photos.findIndex(a => a.uid === uid);

        // get option name
        let name = '';
        let option = this.props.options.options.filter(item => +item.option_id === +optionId)[0];
        if (option) {
            name = option.option_values.filter(value => +value.option_value_id === +valueId)[0].name;
            // update selected value for option
            if (name) {
                $(`#${uid} .item-options [data-option-id="${optionId}"]`).find('button').text(name);
            }
        }

        // update item options
        window.photos[index]['options'][optionId] = {option_id: optionId, option_value_id: valueId, value_name: name};
        window.photos[index][optionName] = optionValue;

        switch (optionName) {
            case 'size':
                let size = optionValue.split(',');
                window.photos[index][optionName] = {width: size[1], height: size[0]};
                this.onFormatChange([size[0], size[1]], element, index);
                break;
            case 'framing':
                window.photos[index].crop = optionValue === 'cropp';
                this.onFramingChange(optionValue, element);
                break;
            case 'border-select':
                window.photos[index].border = optionValue;
                this.onBorderChange(optionValue, index);
                break;

        }
        this.onOptionChange(null, null);
        this.excludeUnsuitableOptions(element, uid, optionId, valueId)
    }

    excludeUnsuitableOptions(element, uid, optionId, valueId) {
        let touchedOption = this.props.options.options.filter(option => +option.option_id === +optionId)[0];
        let touchedOptionValue = touchedOption.option_values.filter(optionValue => +optionValue.option_value_id === +valueId)[0];
        let relatedOptions = touchedOptionValue.relation_options;
        if (relatedOptions) {
            let container = '';
            if (uid) {
                container = `#${uid} `;
            }

            $(`${container}.item-options .dropdown[data-option-id!="${optionId}"] .option.disabled`).addClass('pre-disabled');
            // first make all options for current photo unsuitable
            // except current option
            $(`${container}.item-options .dropdown[data-option-id!="${optionId}"] .option`).addClass('disabled');
            // iterate over related options
            relatedOptions.map(relatedOption => {
                // make related options suitable
                relatedOption.option_value_id.map(value => {

                    $(`${container}.item-options [data-option-id="${relatedOption.option_id}"]`)
                        .find(`[data-option-value-id="${value}"]`)/*.not('.pre-disabled')*/.removeClass('disabled');
                });
            });

            $(`${container}.item-options .option`).removeClass('pre-disabled');
        }

    }

    resetUnsuitableOptions(element, uid, optionId, valueId) {
        // get item position
        const index = window.photos.findIndex(a => a.uid === uid);
        this.props.options.options.map((option) => {
            option.option_values.map(option_value => {
                if (option_value.relation_options) {
                    option_value.relation_options.map(relation_option => {
                        if (relation_option.option_id == optionId && !relation_option.option_value_id.includes(valueId)) {
                            if(option.label && window.photos[index][option.label]){
                                delete window.photos[index][option.label];
                            }
                            if(option.label === 'size'){
                                this.onFormatChange([0, 0], element, index);
                            }
                            $(`#${uid} .item-options .dropdown[data-option-id="${option.option_id}"] button`).text(option.name);
                            $(`#${uid} .item-options .dropdown[data-option-id="${option.option_id}"] button`).addClass('btn-danger');
                            $(`#${uid} .item-options .dropdown[data-option-id="${option.option_id}"] .dropdown-item`).removeClass('active');
                            $(`#${uid} .item-options .option`).removeClass('disabled');
                            delete window.photos[index].options[option.option_id];
                        }
                    });
                }
            });

        });
    }


}
