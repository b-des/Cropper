(function ($) {

    var methods = {
        init: function (options) {
            return this.each(function () {
                this.container = $(this);
                this.obj = $(this);

                this.outputDiv = $(this);
                this.lastValueSlide = 0;

                this.options = $.extend({
                    initialZoom: 0,
                    scaleToFill: true,
                    zoomFactor: 100,
                    fitToContainer: false
                }, options);


                let src = this.obj.attr('data-src');
                var img = $('<img src="' + src + '">');
                this.obj.html(img);
                let that = this;
                this.obj.find('img').on('load', function () {
                    console.log('load');
                    setTimeout(()=>{
                        methods.initCropper.call(that);
                    }, 10);

                });

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


            this.img.css({
                'left': -(this.imgW - this.objW) / 2,
                'top': -(this.imgH - this.objH) / 2,
                'position': 'relative'
            });

            this.obj.on('mousewheel', function (event) {
                event.preventDefault();
                methods.zoomByDelta.call(this, this.options.zoomFactor * event.deltaY);
                this.img.parent().find(".slider").slider("value", this.img.parent().find(".slider").slider("value") + event.deltaY);
            });

            methods.fitToContainer.call(this, this.options.fitToContainer);
            //that.fillContainer();
            methods.initDrag.call(this);
        },

        createUI: function () {
            let html = '';

            let ratio = this.img.width() / this.img.height();
            let pratio = this.obj.width() / this.obj.height();

            if (ratio > pratio) {
                html += '<div class="cut-line line-left"  data-tippy-placement="left"> </div>';
                html += '<div class="cut-line line-right"  data-tippy-placement="right"> </div>';
            } else {
                html += '<div class="cut-line line-top" data-tippy-placement="top"> </div>';
                html += '<div class="cut-line line-bottom"  data-tippy-placement="bottom"> </div>';
            }

            html += '<div class="cross-drag"><i class="fa fa-arrows-alt"></i></div>';
            html += '<div class="slider" ></div>';
            this.outputDiv.append(html);
            let that = this;
            this.outputDiv.find(".slider").slider({
                min: 10,
                max: 100,
                slide: function (event, ui) {
                    methods.zoomByPercent.call(that, ui.value / 10);
                }
            });


        },
        fitToContainer: function (fit) {

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
                this.outputDiv.append(html);

                $(this).find('.offset-line.line-top, .offset-line.line-bottom').css({'height': `${top}px`});
                $(this).find('.offset-line.line-left, .offset-line.line-right').css({'width': `${left}px`});


                this.outputDiv.find(".slider").remove();
                this.outputDiv.find(".cross-drag").remove();
                this.outputDiv.find(".cut-line").remove();
                tippy('.offset-line', {content: document.getElementById('tippy-content-2').innerHTML, theme: 'light',});
            } else {
                methods.createUI.call(this);
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

                    if (that.options.imgEyecandy) {
                        that.imgEyecandy.offset({top: imgTop, left: imgLeft});
                    }

                    if (that.objH < that.imgH) {
                        if (parseInt(that.img.css('top')) > 0) {
                            that.img.css('top', 0);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('top', 0);
                            }
                        }
                        var maxTop = -(that.imgH - that.objH);
                        if (parseInt(that.img.css('top')) < maxTop) {
                            that.img.css('top', maxTop);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('top', maxTop);
                            }
                        }
                    } else {
                        if (parseInt(that.img.css('top')) < 0) {
                            that.img.css('top', 0);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('top', 0);
                            }
                        }
                        var maxTop = that.objH - that.imgH;
                        if (parseInt(that.img.css('top')) > maxTop) {
                            that.img.css('top', maxTop);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('top', maxTop);
                            }
                        }
                    }

                    if (that.objW < that.imgW) {
                        if (parseInt(that.img.css('left')) > 0) {
                            that.img.css('left', 0);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('left', 0);
                            }
                        }
                        var maxLeft = -(that.imgW - that.objW);
                        if (parseInt(that.img.css('left')) < maxLeft) {
                            that.img.css('left', maxLeft);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('left', maxLeft);
                            }
                        }
                    } else {
                        if (parseInt(that.img.css('left')) < 0) {
                            that.img.css('left', 0);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('left', 0);
                            }
                        }
                        var maxLeft = (that.objW - that.imgW);
                        if (parseInt(that.img.css('left')) > maxLeft) {
                            that.img.css('left', maxLeft);
                            if (that.options.imgEyecandy) {
                                that.imgEyecandy.css('left', maxLeft);
                            }
                        }
                    }
                    if (that.options.onImgDrag) that.options.onImgDrag.call(that);

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

            if (newWidth == originalSize) {
                newLeft = newTop = 0;
                console.log("newWidth == originalSize");

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

        update: function(){
            return this.each(function () {
                console.log(this);
                $(this).find('.slider, .cross-drag, .cut-line, .offset-line').remove();
                methods.zoomByDelta.call(this, -this.imgInitW);
                methods.zoomByDelta.call(this, this.options.initialZoom);


                this.img.css({
                    'left': -(this.imgW - this.objW) / 2,
                    'top': -(this.imgH - this.objH) / 2,
                    'position': 'relative'
                });
                methods.fitToContainer.call(this, false);
            });
        },

        destroy() {
            return this.each(function () {
                console.log($(this));
                $(this).find('.slider, .cross-drag, .cut-line, .offset-line').remove();
                //$(window).unbind('.cropper');
                methods.fitToContainer.call(this, true);
            })
        }
    };

    $.fn.cropper = function (method) {


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


