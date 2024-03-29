(function ($) {

    let methods = {
        init: function (options) {
            return this.each(function () {
                this.container = $(this);
                this.obj = $(this);

                this.outputDiv = $(this);
                this.lastValueSlide = 0;

                this.options = $.extend({
                    top: null,
                    left: null,
                    initialZoom: 0,
                    scaleToFill: true,
                    zoomFactor: 100,
                    fitToContainer: true,
                    createUI: true,
                    initilized: false,
                    onZoom: null,
                    onLoad: null
                }, options);


                let src = this.obj.attr('data-src');
                let that = this;


                if (!this.obj.find('img').length) {
                    let img = $('<img src="' + src + '">');

                    //this.obj.html(img);
                    img.on('load', () => {
                        //setTimeout(methods.initCropper.bind(this),100);
                    });

                    let tmpImage = new Image();
                    tmpImage.src = src;
                    tmpImage.onload = function () {
                        that.options.onLoad(that.obj.attr('data-uid'), this.width, this.height);
                        that.obj.append(this);
                        that.obj.append('<div class="border-frame"></div>');

                        setTimeout(methods.initCropper.bind(that), 500);
                    };

                    tmpImage.onerror = function () {
                        that.obj.closest('.image-container').remove();
                    }

                } else {
                    methods.initCropper.call(this)
                }


            });
        },

        initCropper: function () {

            this.objW = this.obj.width();
            this.objH = this.obj.height();
            this.initialWidth = this.obj.width();
            this.img = this.obj.find('img');

            if (!this.obj.hasClass('cropper-container'))
                this.obj.addClass('cropper-container');


            this.imgInitW = this.imgW = this.img.width();
            this.imgInitH = this.imgH = this.img.height();
            if (this.imgInitH && this.imgInitW ) {
                methods.zoomByDelta.call(this, -this.imgInitW);
                methods.zoomByDelta.call(this, +this.options.initialZoom);
            }
            this.imgInitW = this.imgW = this.img.width();
            this.imgInitH = this.imgH = this.img.height();
            //if(!this.options.left){
            this.options.left = this.obj.attr('data-left');
            // }

            // if(!this.options.top){
            this.options.top = this.obj.attr('data-top');
            // }


            //if(!this.options.initialZoom){
            this.options.initialZoom = this.obj.attr('data-zoom') || 0;
            // }


            if (this.options.initialZoom > 0) {
                methods.zoomByPercent.call(this, this.options.initialZoom);
            }


            if (this.options.top !== '' || this.options.left !== '') {
                this.img.css({
                    'left': `${parseFloat(this.options.left)}px`,
                    'top': `${parseFloat(this.options.top)}px`,
                    'position': 'relative'
                });
                methods.normalizeOffset.call(this);

            } else {
                this.img.css({
                    'left': -(this.imgW - this.objW) / 2,
                    'top': -(this.imgH - this.objH) / 2,
                    'position': 'relative'
                });
            }


            methods.createUI.call(this);
            methods.fitToContainer.call(this, this.options.fitToContainer);
            //that.fillContainer();
            methods.initDrag.call(this);
        },

        createUI: function () {
            let html = '';

            let ratio = this.img.width() / this.obj.width();
            let pratio = this.img.height() / this.obj.height();

            this.outputDiv.find(".slider").slider('destroy');
            this.outputDiv.find('*').not('img, .border-frame').remove();
            let width = (parseInt(this.obj.closest('.image-item').innerWidth()) - parseInt(this.obj.width()))/2 ;
            let height = (parseInt(this.obj.closest('.image-item').innerHeight()) - parseInt(this.obj.height()))/2 ;

            if (width && width > 0) {
                html += `<div class="cut-line line-left" style="width: ${width}px; left: -${width}px" data-tippy-placement="left"> </div>`;
                html += `<div class="cut-line line-right"   style="width: ${width}px; right: -${width}px"  data-tippy-placement="right"> </div>`;
            }
            if (height && height > 0) {

                html += `<div class="cut-line line-top" style="height: ${height}px;  top: -${height}px" data-tippy-placement="top"> </div>`;
                html += `<div class="cut-line line-bottom" style="height: ${height}px; bottom: -${height}px" data-tippy-placement="bottom"> </div>`;
            }

            html += '<div class="cross-drag"><i class="fa fa-arrows-alt"></i></div>';
            html += '<div class="slider" ></div>';
            this.outputDiv.append(html);
            let that = this;

            this.outputDiv.find(".slider").slider({
                value: this.options.initialZoom * 10,
                min: 10,
                max: 30,
                step: 0.1,
                start: function (event, ui) {
                    that.obj.attr('data-top', parseFloat(that.img.css('top')));
                    that.obj.attr('data-left', parseFloat(that.img.css('left')));
                },
                slide: function (event, ui) {
                    if (that.options.onZoom) that.options.onZoom.call(that, that.obj.attr('data-uid'), ui.value / 10);
                    that.obj.attr('data-zoom', ui.value / 10);
                    methods.zoomByPercent.call(that, ui.value / 10);
                }
            });
        },

        showUi() {
            this.obj.find('*').removeClass('hidden');
        },

        hideUi() {
            this.obj.find('*').addClass('hidden');
        },

        fitToContainer: function (fit) {
            this.obj.attr('data-crop', !fit);
            if (fit) {
                let css;
                let html = '';
                let ratio = this.img.width() / this.img.height();
                let pratio = this.obj.width() / this.obj.height();
                if (ratio < pratio) {
                    css = {width: 'auto', height: this.obj.height()};
                    html += '<div class="offset-line line-left"> </div>';
                    html += '<div class="offset-line line-right"> </div>';
                } else {
                    css = {width: this.obj.width(), height: 'auto'};
                    let height = (this.img.height() - this.obj.height());
                    html += '<div class="offset-line line-top"> </div>';
                    html += '<div class="offset-line line-bottom"> </div>';
                }
                this.img.css(css);
                let top = -(this.img.height() - this.objH) / 2;
                let left = -(this.img.width() - this.objW) / 2;
                this.img.css({
                    'left': left,
                    'top': top,
                    'position': 'relative'
                });

                this.outputDiv.find(".offset-line").remove();
                if (this.options.createUI)
                    this.outputDiv.append(html);
                let padding = parseFloat(this.obj.css('padding-top'));

                $(this).find('.offset-line.line-top, .offset-line.line-bottom').css({'height': `${top+padding}px`, 'width': `calc(100% - ${padding}px)`});
                $(this).find('.offset-line.line-left, .offset-line.line-right').css({'width': `${left+padding}px`, 'height' : `calc(100% - ${padding}px)`});


                this.outputDiv.find(".slider").remove();
                this.outputDiv.find(".cross-drag").remove();
                this.outputDiv.find(".cut-line").remove();

            } else {
                methods.showUi.call(this);
            }

            try{
                tippy('.cut-line', {content: document.getElementById('tippy-content-1').innerHTML, theme: 'light',});
                tippy('.offset-line', {content: document.getElementById('tippy-content-2').innerHTML, theme: 'light',});
            }catch (e) {

            }
        },


        normalizeOffset: function () {
            if (this.objH < this.imgH) {
                if (parseInt(this.img.css('top')) > 0) {
                    this.img.css('top', 0);

                }
                let maxTop = -(this.imgH - this.objH);
                if (parseInt(this.img.css('top')) < maxTop) {
                    this.img.css('top', maxTop);

                }
            } else {
                if (parseInt(this.img.css('top')) < 0) {
                    this.img.css('top', 0);
                }
                let maxTop = this.objH - this.imgH;
                if (parseInt(this.img.css('top')) > maxTop) {
                    this.img.css('top', maxTop);

                }
            }

            if (this.objW < this.imgW) {
                if (parseInt(this.img.css('left')) > 0) {
                    this.img.css('left', 0);

                }
                let maxLeft = -(this.imgW - this.objW);
                if (parseInt(this.img.css('left')) < maxLeft) {
                    this.img.css('left', maxLeft);

                }
            } else {
                if (parseInt(this.img.css('left')) < 0) {
                    this.img.css('left', 0);

                }
                let maxLeft = (this.objW - this.imgW);
                if (parseInt(this.img.css('left')) > maxLeft) {
                    this.img.css('left', maxLeft);

                }
            }
        },

        initDrag: function (content) {
            let that = this;
            that.img.parents("[data-crop='true']").find('img, .border-frame').on("mousedown touchstart", function (e) {

                e.preventDefault(); // disable selection
                if(that.img.parents("[data-crop='false']").length){
                    return false;
                }
                let pageX;
                let pageY;
                let userAgent = window.navigator.userAgent;
                if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/android/i) || (e.pageY && e.pageX) == undefined) {
                    pageX = e.originalEvent.touches[0].pageX;
                    pageY = e.originalEvent.touches[0].pageY;
                } else {
                    pageX = e.pageX;
                    pageY = e.pageY;
                }

                let z_idx = that.img.css('z-index'),
                    drg_h = that.img.outerHeight(),
                    drg_w = that.img.outerWidth(),
                    pos_y = that.img.offset().top + drg_h - pageY,
                    pos_x = that.img.offset().left + drg_w - pageX;

                //that.img.css('z-index', 99);

                $('body').on("mousemove touchmove", function (e) {

                    let imgTop;
                    let imgLeft;

                    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/android/i) || (e.pageY && e.pageX) == undefined) {
                        imgTop = e.originalEvent.touches[0].pageY + pos_y - drg_h;
                        imgLeft = e.originalEvent.touches[0].pageX + pos_x - drg_w;
                    } else {
                        imgTop = e.pageY + pos_y - drg_h;
                        imgLeft = e.pageX + pos_x - drg_w;
                    }

                    that.img.offset({
                        top: imgTop,
                        left: imgLeft
                    }).on("mouseup", function () {
                        $(this).removeClass('draggable').css('z-index', z_idx);
                    });


                    methods.normalizeOffset.call(that);
                    that.obj.attr('data-top', parseInt(that.img.css('top')));
                    that.obj.attr('data-left', parseInt(that.img.css('left')));
                    if (that.options.onImgDrag)
                        that.options.onImgDrag.call(that, that.obj.attr('data-uid'), parseInt(that.img.css('left')), parseInt(that.img.css('top')));

                });

            });

            $('body').on("mouseup touchend", function () {
                $('body').off("mousemove");
                $('body').off("touchmove");
            })
        },
        zoomByPercent: function (value) {
            let originalSize = this.imgInitW;
            let ratio = this.imgW / this.imgH;
            let doPositioning = true;
            let newWidth = originalSize * value;
            let newHeight = newWidth / ratio;

            if (newWidth < this.objW || newHeight < this.objH) {

                if (newWidth - this.objW < newHeight - this.objH) {
                    newWidth = this.objW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = this.objH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }

            if (!this.options.scaleToFill && (newWidth > this.imgInitW || newHeight > this.imgInitH)) {

                if (newWidth - this.imgInitW < newHeight - this.imgInitH) {
                    newWidth = this.imgInitW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = this.imgInitH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }

            this.imgW = newWidth;
            this.img.width(newWidth);

            this.imgH = newHeight;
            this.img.height(newHeight);

            let newTop = parseInt(this.img.css('top'));
            let newLeft = parseInt(this.img.css('left'));

            if (newTop > 0) {
                newTop = 0;
            }
            if (newLeft > 0) {
                newLeft = 0;
            }

            let maxTop = -(newHeight - this.objH);
            if (newTop < maxTop) {
                newTop = maxTop;
            }
            let maxLeft = -(newWidth - this.objW);
            if (newLeft < maxLeft) {
                newLeft = maxLeft;
            }


            if (doPositioning) {
                this.img.css({'top': newTop, 'left': newLeft});
            }

            if (this.objH < this.imgH) {
                if (parseInt(this.img.css('top')) > 0) {
                    this.img.css('top', 0);
                }
                let maxTop = -(this.imgH - this.objH);
                if (parseInt(this.img.css('top')) < maxTop) {
                    this.img.css('top', maxTop);
                    if (this.options.imgEyecandy) {
                        this.imgEyecandy.css('top', maxTop);
                    }
                }
            } else {
                if (parseInt(this.img.css('top')) < 0) {
                    this.img.css('top', 0);

                }
                let maxTop = this.objH - this.imgH;
                if (parseInt(this.img.css('top')) > maxTop) {
                    this.img.css('top', maxTop);

                }
            }

            if (this.objW < this.imgW) {
                if (parseInt(this.img.css('left')) > 0) {
                    this.img.css('left', 0);

                }
                let maxLeft = -(this.imgW - this.objW);
                if (parseInt(this.img.css('left')) < maxLeft) {
                    this.img.css('left', maxLeft);

                }
            } else {
                if (parseInt(this.img.css('left')) < 0) {
                    this.img.css('left', 0);
                }
                let maxLeft = (this.objW - this.imgW);
                if (parseInt(this.img.css('left')) > maxLeft) {
                    this.img.css('left', maxLeft);

                }
            }
        },

        zoomByDelta: function (x) {
            let that = this;
            let ratio = that.imgW / that.imgH;
            let newWidth = that.imgW + x;
            let newHeight = newWidth / ratio;
            let doPositioning = true;

            if (newWidth < that.objW || newHeight < that.objH) {

                if (newWidth - that.objW < newHeight - that.objH) {
                    newWidth = that.objW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = that.objH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }

            if (!this.options.scaleToFill && (newWidth > this.imgInitW || newHeight > this.imgInitH)) {

                if (newWidth - this.imgInitW < newHeight - this.imgInitH) {
                    newWidth = this.imgInitW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = this.imgInitH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }
            this.imgW = newWidth;
            this.img.width(newWidth);

            this.imgH = newHeight;
            this.img.height(newHeight);

            let newTop = parseInt(this.img.css('top')) - x / 2;
            let newLeft = parseInt(this.img.css('left')) - x / 2;

            if (newTop > 0) {
                newTop = 0;
            }
            if (newLeft > 0) {
                newLeft = 0;
            }

            let maxTop = -(newHeight - that.objH);
            if (newTop < maxTop) {
                newTop = maxTop;
            }
            let maxLeft = -(newWidth - that.objW);
            if (newLeft < maxLeft) {
                newLeft = maxLeft;
            }

            if (doPositioning) {
                this.img.css({'top': newTop, 'left': newLeft});
            }


        },

        setOption: function (option, value) {

            return this.each(function () {
                this.options[option] = value;
            })
        },

        update: function (options) {
            return this.each(function () {
                if(!this.options)
                    return;
                if (options) {
                    this.options.rotate = false;
                    this.options.createUI = true;
                    this.options = $.extend(this.options, options);
                }

                this.options.initialZoom = parseFloat(this.obj.attr('data-zoom'));

                if (!this.obj.find('img').length) {
                    let src = this.obj.attr('data-src');
                    let that = this;
                    let tmpImage = new Image();
                    tmpImage.src = src;
                    tmpImage.onload = function () {

                        that.obj.html(this);

                        that.obj.append('<div class="border-frame"></div>');
                        if (that.options.onLoad) that.options.onLoad(that.obj.attr('data-uid'), this.width, this.height, true);

                        if (that.obj.hasClass('enabled') && parseInt(that.obj.attr('data-border-thickness'))){
                            let thickness = (that.obj.attr('data-border-thickness') || window.defaultBorderWidth) / window.MM_KOEF;
                            let color = that.obj.attr('data-border');
                            that.obj.find('.border-frame').css('border', `${thickness}px solid ${color}`).css('z-index', '1');
                        }

                        if (that.obj.attr('data-border') && that.obj.attr('data-border') !== 'none')
                            that.obj.find('.border-frame').css('z-index', '99');


                        setTimeout(methods.initCropper.bind(that), 10);
                    };

                    tmpImage.onerror = function () {
                        console.log('load failed');
                    }

                } else {

                    methods.initCropper.call(this)
                }

                /*$(this).find('.slider, .cross-drag, .cut-line, .offset-line').remove();
                methods.zoomByDelta.call(this, -this.imgInitW);
                methods.zoomByDelta.call(this, this.options.initialZoom);


                this.img.css({
                    'left': -(this.imgW - this.objW) / 2,
                    'top': -(this.imgH - this.objH) / 2,
                    'position': 'relative'
                });
                methods.fitToContainer.call(this, false);*/
            });
        },

        reset: function () {
            return this.each(function () {
                this.obj.css({width: '100%', height: '100%'})
                methods.zoomByDelta.call(this, -this.imgInitW);
                methods.zoomByDelta.call(this, this.options.initialZoom);

                this.outputDiv.find('*').not('img, .border-frame').remove();
                this.options.createUI = false;
                this.options.fitToContainer = true;
                methods.initCropper.call(this);
            });
        },

        destroy() {
            return this.each(function () {
                this.options.createUI = false;
                $(this).find('.slider, .cross-drag, .cut-line, .offset-line').remove();
                //$(window).unbind('.cropper');
                methods.fitToContainer.call(this, true);
            })
        }
    };

    $.fn.cropper = function (method, value, res) {


        if (method === 'option') {

            return methods.setOption.call(this, arguments[1], arguments[2])
        }

        if (method === 'update') {
            return methods.update.call(this, arguments[1])
        }

        // Apply options
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для Cropper');
        }

    };

}(jQuery));
