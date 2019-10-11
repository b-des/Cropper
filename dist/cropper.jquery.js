(function ($) {

    var methods = {
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
                    fitToContainer: false,
                    createUI: true,
                    initilized: false,
                    onZoom: null,
                    onLoad: null
                }, options);


                let src = this.obj.attr('data-src');
                let that = this;


                if (!this.obj.find('img').length) {
                    var img = $('<img src="' + src + '">');

                    //this.obj.html(img);
                    img.on('load', () => {
                        //setTimeout(methods.initCropper.bind(this),100);
                    });

                    let tmpImage = new Image();
                    tmpImage.src = src;
                    tmpImage.onload = function () {
                        that.options.onLoad(that.obj.attr('data-uid'), this.width, this.height);
                        that.obj.html(this);
                        that.obj.append('<div class="border-frame"></div>');

                        setTimeout(methods.initCropper.bind(that), 10);
                    };

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
            this.imgInitW = this.imgW = this.img.width();
            this.imgInitH = this.imgH = this.img.height();
            this.obj.get(0).className += ' cropper-container';

            methods.zoomByDelta.call(this, -this.imgInitW);
            methods.zoomByDelta.call(this, this.options.initialZoom);

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


            if (this.options.left && this.options.left) {
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


            this.obj.on('mousewheel', function (event) {
                event.preventDefault();
                methods.zoomByDelta.call(this, this.options.zoomFactor * event.deltaY);
                this.img.parent().find(".slider").slider("value", this.img.parent().find(".slider").slider("value") + event.deltaY);
            });

            methods.createUI.call(this);
            methods.fitToContainer.call(this, this.options.fitToContainer);
            //that.fillContainer();
            methods.initDrag.call(this);
        },

        createUI: function () {
            let html = '';

            let ratio = this.img.width() / this.img.height();
            let pratio = this.obj.width() / this.obj.height();

            this.outputDiv.find(".slider").slider('destroy');
            this.outputDiv.find('*').not('img, .border-frame').remove();

            if (ratio > pratio) {
                // html += '<div class="cut-line line-left"  data-tippy-placement="left"> </div>';
                //html += '<div class="cut-line line-right"  data-tippy-placement="right"> </div>';
            } else {
                // html += '<div class="cut-line line-top" data-tippy-placement="top"> </div>';
                //html += '<div class="cut-line line-bottom"  data-tippy-placement="bottom"> </div>';
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
            this.obj.attr('data-crop', !fit)
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

                $(this).find('.offset-line.line-top, .offset-line.line-bottom').css({'height': `${top}px`});
                $(this).find('.offset-line.line-left, .offset-line.line-right').css({'width': `${left}px`});


                this.outputDiv.find(".slider").remove();
                this.outputDiv.find(".cross-drag").remove();
                this.outputDiv.find(".cut-line").remove();

            } else {
                methods.showUi.call(this);
            }

            tippy('.cut-line', {content: document.getElementById('tippy-content-1').innerHTML, theme: 'light',});
            tippy('.offset-line', {content: document.getElementById('tippy-content-2').innerHTML, theme: 'light',});

        },


        normalizeOffset: function () {
            if (this.objH < this.imgH) {
                if (parseInt(this.img.css('top')) > 0) {
                    this.img.css('top', 0);

                }
                var maxTop = -(this.imgH - this.objH);
                if (parseInt(this.img.css('top')) < maxTop) {
                    this.img.css('top', maxTop);

                }
            } else {
                if (parseInt(this.img.css('top')) < 0) {
                    this.img.css('top', 0);
                }
                var maxTop = this.objH - this.imgH;
                if (parseInt(this.img.css('top')) > maxTop) {
                    this.img.css('top', maxTop);

                }
            }

            if (this.objW < this.imgW) {
                if (parseInt(this.img.css('left')) > 0) {
                    this.img.css('left', 0);

                }
                var maxLeft = -(this.imgW - this.objW);
                if (parseInt(this.img.css('left')) < maxLeft) {
                    this.img.css('left', maxLeft);

                }
            } else {
                if (parseInt(this.img.css('left')) < 0) {
                    this.img.css('left', 0);

                }
                var maxLeft = (this.objW - this.imgW);
                if (parseInt(this.img.css('left')) > maxLeft) {
                    this.img.css('left', maxLeft);

                }
            }
        },

        initDrag: function (content) {
            var that = this;

            that.img.parent().find('.cross-drag').on("mousedown touchstart", function (e) {

                e.preventDefault(); // disable selection

                var pageX;
                var pageY;
                var userAgent = window.navigator.userAgent;
                if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/android/i) || (e.pageY && e.pageX) == undefined) {
                    pageX = e.originalEvent.touches[0].pageX;
                    pageY = e.originalEvent.touches[0].pageY;
                } else {
                    pageX = e.pageX;
                    pageY = e.pageY;
                }

                var z_idx = that.img.css('z-index'),
                    drg_h = that.img.outerHeight(),
                    drg_w = that.img.outerWidth(),
                    pos_y = that.img.offset().top + drg_h - pageY,
                    pos_x = that.img.offset().left + drg_w - pageX;

                that.img.css('z-index', 99);

                $('body').on("mousemove touchmove", function (e) {

                    var imgTop;
                    var imgLeft;

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
                    that.options.onImgDrag.call(that, that.obj.attr('data-uid'), parseInt(that.img.css('left')), parseInt(that.img.css('top')));

                });

            });

            $('body').on("mouseup", function () {
                $('body').off("mousemove");
            })
        },
        zoomByPercent: function (value) {
            let originalSize = this.initialWidth;
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

            var newTop = parseInt(this.img.css('top'));
            var newLeft = parseInt(this.img.css('left'));

            if (newTop > 0) {
                newTop = 0;
            }
            if (newLeft > 0) {
                newLeft = 0;
            }

            var maxTop = -(newHeight - this.objH);
            if (newTop < maxTop) {
                newTop = maxTop;
            }
            var maxLeft = -(newWidth - this.objW);
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
                var maxTop = -(this.imgH - this.objH);
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
                var maxTop = this.objH - this.imgH;
                if (parseInt(this.img.css('top')) > maxTop) {
                    this.img.css('top', maxTop);

                }
            }

            if (this.objW < this.imgW) {
                if (parseInt(this.img.css('left')) > 0) {
                    this.img.css('left', 0);

                }
                var maxLeft = -(this.imgW - this.objW);
                if (parseInt(this.img.css('left')) < maxLeft) {
                    this.img.css('left', maxLeft);

                }
            } else {
                if (parseInt(this.img.css('left')) < 0) {
                    this.img.css('left', 0);
                }
                var maxLeft = (this.objW - this.imgW);
                if (parseInt(this.img.css('left')) > maxLeft) {
                    this.img.css('left', maxLeft);

                }
            }
        },

        zoomByDelta: function (x) {
            var that = this;
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

            var newTop = parseInt(this.img.css('top')) - x / 2;
            var newLeft = parseInt(this.img.css('left')) - x / 2;

            if (newTop > 0) {
                newTop = 0;
            }
            if (newLeft > 0) {
                newLeft = 0;
            }

            var maxTop = -(newHeight - that.objH);
            if (newTop < maxTop) {
                newTop = maxTop;
            }
            var maxLeft = -(newWidth - that.objW);
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
                if (options) {
                    this.options = $.extend(this.options, options);
                    this.options.createUI = true;
                }
                this.options.initialZoom = parseFloat(this.obj.attr('data-zoom'));


                if (!this.obj.find('img').length) {
                    let src = this.obj.attr('data-src');
                    let that = this;
                    let tmpImage = new Image();
                    tmpImage.src = src;
                    tmpImage.onload = function () {
                        that.options.onLoad(that.obj.attr('data-uid'), this.width, this.height);
                        that.obj.html(this);

                        that.obj.append('<div class="border-frame"></div>');
                        if (that.obj.hasClass('enabled'))
                            that.obj.find('.border-frame').css('border', `3px solid ${that.obj.attr('data-border')}`);

                        setTimeout(methods.initCropper.bind(that), 10);
                    };

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


