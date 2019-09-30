
(function (window, document) {
    let that = this;
    CropperT = function (container, options) {
        that = this;
        that.container = container;
        that.obj = $(container);

        that.outputDiv = that.obj;
        that.lastValueSlide = 0;
        that.options = {
            initialZoom: 0,
            scaleToFill: true,
            zoomFactor: 100,
        };
        // OVERWRITE DEFAULT OPTIONS
        for (i in options) that.options[i] = options[i];

        // INIT THE WHOLE DAMN THING!!!
        setTimeout(()=>{
            that.init();
        },100);

    };

    CropperT.prototype = {

        init: function () {
            var that = this;
            that.objW = that.obj.width();
            that.objH = that.obj.height();
            that.initialWidth = that.obj.width();
            that.img = that.obj.find('img');
            that.imgInitW = that.imgW = that.img.width();
            that.imgInitH = that.imgH = that.img.height();
            that.obj.get(0).className += ' cropper-container';

            that.zoomByDelta(-that.imgInitW);
            that.zoomByDelta(that.options.initialZoom);


            that.img.css({
                'left': -(that.imgW - that.objW) / 2,
                'top': -(that.imgH - that.objH) / 2,
                'position': 'relative'
            });
            that.obj.on('mousewheel', function (event) {
                event.preventDefault();
                that.zoomByDelta(that.options.zoomFactor * event.deltaY);
                that.img.parent().find(".slider").slider("value", that.img.parent().find(".slider").slider("value") + event.deltaY);
            });

            that.fitToContainer(false);
            //that.fillContainer();
            that.initDrag();
        },

        createUI: function () {
            var that = this;
            let html = '';

            let ratio = that.img.width() / that.img.height();
            let pratio = that.obj.width() / that.obj.height();

            if (ratio > pratio) {
                html += '<div class="cut-line line-left"  data-tippy-placement="left"> </div>';
                html += '<div class="cut-line line-right"  data-tippy-placement="right"> </div>';
            } else {
                html += '<div class="cut-line line-top" data-tippy-placement="top"> </div>';
                html += '<div class="cut-line line-bottom"  data-tippy-placement="bottom"> </div>';
            }

            html += '<div class="cross-drag"><i class="fa fa-arrows-alt"></i></div>';
            html += '<div class="slider" ></div>';
            that.outputDiv.append(html);
            that.outputDiv.find(".slider").slider({
                min: 10,
                max: 100,
                slide: function (event, ui) {
                    let delta = ui.value > that.lastValueSlide ? 1 : -1;
                    //that.zoomByDelta(that.options.zoomFactor * delta);
                    that.lastValueSlide = ui.value;
                    that.zoomByPercent(ui.value/10);
                }
            });
        },

        fitToContainer: function (fit) {
            if (fit) {
                let css;
                let html = '';
                let ratio = that.img.width() / that.img.height();
                let pratio = that.obj.width() / that.obj.height();
                if (ratio < pratio) {
                    css = {width: 'auto', height: that.obj.height()};
                    html += '<div class="offset-line line-left"> </div>';
                    html += '<div class="offset-line line-right"> </div>';
                } else {
                    css = {width: that.obj.width(), height: 'auto'};
                    let height = (that.img.height() - that.obj.height()) ;
                    html += '<div class="offset-line line-top"> </div>';
                    html += '<div class="offset-line line-bottom"> </div>';
                }
                that.img.css(css);
                let top = -(that.img.height() - that.objH) / 2;
                let left = -(that.img.width() - that.objW) / 2;
                that.img.css({
                    'left': left,
                    'top': top,
                    'position': 'relative'
                });

                that.outputDiv.find(".offset-line").remove();
                that.outputDiv.append(html);

                $('.offset-line.line-top, .offset-line.line-bottom').css({'height': `${top}px`});
                $('.offset-line.line-left, .offset-line.line-right').css({'width': `${left}px`});


                that.outputDiv.find(".slider").remove();
                that.outputDiv.find(".cross-drag").remove();
                that.outputDiv.find(".cut-line").remove();
                tippy('.offset-line',{ content: document.getElementById('tippy-content-2').innerHTML,theme: 'light', });
            } else {
                that.createUI();
            }


        },

        fillContainer: function () {
            var css;
            var ratio = that.img.width() / that.img.height();
            var pratio = that.obj.width() / that.obj.height();
            if (ratio < pratio) css = {width: that.obj.width(), height: 'auto'};
            else css = {width: 'auto', height: that.obj.height()};
            that.img.css(css);
            that.img.css({
                'left': -(that.img.width() - that.objW) / 2,
                'top': -(that.img.height() - that.objH) / 2,
                'position': 'relative'
            });
        },


        initDrag: function () {
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

            let originalSize = that.initialWidth;
            let ratio = that.imgW / that.imgH;
            let doPositioning = true;
            let newWidth = originalSize*value;
            let newHeight = newWidth / ratio;
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

            if (!that.options.scaleToFill && (newWidth > that.imgInitW || newHeight > that.imgInitH)) {

                if (newWidth - that.imgInitW < newHeight - that.imgInitH) {
                    newWidth = that.imgInitW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = that.imgInitH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }

            that.imgW = newWidth;
            that.img.width(newWidth);

            that.imgH = newHeight;
            that.img.height(newHeight);

            var newTop = parseInt(that.img.css('top')) ;
            var newLeft = parseInt(that.img.css('left')) ;

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

            if(newWidth == originalSize){
                newLeft = newTop = 0;
                console.log("newWidth == originalSize");

            }

            if (doPositioning) {
                that.img.css({'top': newTop, 'left': newLeft});
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

            if (that.options.onImgZoom) that.options.onImgZoom.call(that);
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

            if (!that.options.scaleToFill && (newWidth > that.imgInitW || newHeight > that.imgInitH)) {

                if (newWidth - that.imgInitW < newHeight - that.imgInitH) {
                    newWidth = that.imgInitW;
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = that.imgInitH;
                    newWidth = ratio * newHeight;
                }

                doPositioning = false;

            }
            that.imgW = newWidth;
            that.img.width(newWidth);

            that.imgH = newHeight;
            that.img.height(newHeight);

            var newTop = parseInt(that.img.css('top')) - x / 2;
            var newLeft = parseInt(that.img.css('left')) - x / 2;

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
                that.img.css({'top': newTop, 'left': newLeft});
            }


            if (that.options.onImgZoom) that.options.onImgZoom.call(that);

        },

        destroy:function(){
            //that.obj.html('');
        },
    }
})(window, document);
