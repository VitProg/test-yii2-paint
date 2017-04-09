Painter = function (div, options) {

    var settings = $.extend({
        width:         800,
        height:        600,
        brush_width:   [1, 2, 3, 5, 8, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        brush_opacity: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        save_url:      null,
        img_url:       null,
        modal:         '#paint-modal'
    }, options);

    var max_brush_width = settings.brush_width[settings.brush_width.length - 1];

    var _painter_index = Painter._painter_index++;
    var ID = 'painter__' + _painter_index;

    /** @type {Painter} */
    var self = this;

    var _brushes = {};
    var brushes_count = 0;
    this.brushes = {};

    this.disabled = false;

    this.backGroundImage = '';
    if (settings.img_url) {
        this.backGroundImage = settings.img_url;
    }

    //noinspection JSUnusedGlobalSymbols
    this.current_image = null;

    this.keyboard = {
        alt:   false,
        shift: false
    };

    this.mouse = {
        pressed: false,
        touched: false,
        out:     true
    };

    var saveTimeOut = null;

    /** @type {PaintHistory} */
    this.history = false;

    /*-------------------*/

    this.div = $(div);
    this.div.attr('data-id', ID);

    this.modal = $(settings.modal);
    this.modal.attr('data-id', ID);

    /*-------------------*/
    var curr_bg_image_opacity = 0.4;

    var curr_color_r = 0;
    var curr_color_g = 0;
    var curr_color_b = 0;

    var curr_color_bg_r = 255;
    var curr_color_bg_g = 255;
    var curr_color_bg_b = 255;

    var curr_line_width = 2;
    var curr_opacity = 1;
    var curr_composite_op = "source-over";

    function color_str(r, g, b, alpha) {
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }

    function color_rgb(r, g, b) {
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    /*-------------------*/

    /** @this {Painter} */
    var _init = function () {
        this.div.html('');
        this.div.addClass('panel panel-default panel-body painter-editor');

        this.$controls = $('<div class="controls btn-toolbar clearfix"></div>');
        this.$canvasContainer = $('<div id="' + ID + '__cont_canvas" class="cont_canvas"></div>');
        this.$canvas = $('<canvas id="' + ID + '__canvas" class="canvas"></canvas>');
        this.$canvasCursor = $('<canvas id="' + ID + '__canvas_cursor" class="canvas_cursor"></canvas>');
        this.$bgImage = $('<img src=""/>');

        this.div.append(this.$controls);
        this.div.append(this.$canvasContainer);
        this.$canvasContainer.append(this.$bgImage);
        this.$canvasContainer.append(this.$canvas);
        this.$canvasContainer.append(this.$canvasCursor);

        this.div.css({
            position:      'relative',
            'z-index':     0,
            'user-select': 'none'
        });

        this.$canvasContainer.css({
            position: 'relative',
            width:    settings.width,
            height:   settings.height,
            overflow: 'hidden',
            cursor:   "none"
        });

        // background image
        this.$bgImage.css({
            position:  'absolute',
            top:       0,
            left:      0,
            display:   'none',
            width:     settings.width,
            height:    settings.height,
            'z-index': 1
        });

        // init canvas
        this.$canvas.css({
            width:     settings.width,
            height:    settings.height,
            position:  'absolute',
            cursor:    "none",
            top:       0,
            left:      0,
            'z-index': 2
        });
        this.$canvas.attr('width', settings.width);
        this.$canvas.attr('height', settings.height);

        this.canvas = this.$canvas.get(0);
        this.context = this.canvas.getContext('2d');
        this.context.save();
        this.context.clearRect(0, 0, settings.width, settings.height);
        this.context.restore();

        // init canvas cursor
        var w = max_brush_width * 1.25;
        var h = max_brush_width * 1.25;
        this.$canvasCursor.css({
            width:     w,
            height:    h,
            position:  'relative',
            top:       0,
            left:      0,
            'z-index': 3,
            cursor:    "none"
        });
        this.$canvasCursor.attr('width', w);
        this.$canvasCursor.attr('height', h);
        this.canvasCursor = this.$canvasCursor.get(0);
        this.contextCursor = this.canvasCursor.getContext('2d');

        // init buffer canvas
        this.canvasBuffer = document.createElement('canvas');
        this.canvasBuffer.width = settings.width;
        this.canvasBuffer.height = settings.height;
        this.contextBuffer = this.canvasBuffer.getContext('2d');
        this.contextBuffer.save();
        this.contextBuffer.clearRect(0, 0, settings.width, settings.height);
        this.contextBuffer.restore();

        this.canvasBuffer2 = document.createElement('canvas');
        this.canvasBuffer2.width = settings.width;
        this.canvasBuffer2.height = settings.height;
        this.contextBuffer2 = this.canvasBuffer2.getContext('2d');
        this.contextBuffer2.save();
        this.contextBuffer2.clearRect(0, 0, settings.width, settings.height);
        this.contextBuffer2.restore();


        // toolbar

        this.$brushpicker = $('<div class="brush-picker pull-left btn-group"></div>');
        for (var i in this.brushes) {
            if (this.brushes.hasOwnProperty(i) === false) {
                continue;
            }
            var brush = new this.brushes[i](this.context, this.contextBuffer);
            this.$brushpicker.append('<a href="#" class="btn btn-default brush" data-name="' + i + '" class="brush" title="' + brush.title + '"><i class="' + brush.icon + '"></i></a>');
            _brushes[brush.name] = brush;
            brushes_count++;
            if (this.brush == null) {
                this.brush = _brushes[brush.name];
                this.$brushpicker.find('a:last').addClass('active');
            }
        }

        // init controls
        // инициализация панели инструментов
        this.$controls.append(this.$brushpicker);
        this.$controls.append('<div class="undo-redo clearfix btn-group">' +
                              '<a href="#" class="btn btn-default undo disabled" title="Отменить"><i class="glyphicon glyphicon-share-alt glyphicon-h-mirror"></i></a>' +
                              '<a href="#" class="btn btn-default redo disabled" title="Повторить"><i class="glyphicon glyphicon-share-alt"></i></a>' +
                              '</div>');
        this.$controls.append('<div class="p_setting brush-settings clearfix btn-group input-group">' +
                              '<span class="input-group-addon">Толщина</span> <select class="line-width form-control"></select>' +
                              '</div>');
        this.$controls.append('<div class="system clearfix pull-right btn-group">' +
                              '<a href="#" class="btn btn-warning clear-image" title="Очистить"><i class="glyphicon glyphicon-ban-circle"></i></a>' +
                              (settings.save_url ? '<a href="#" class="btn btn-success txt-right save" title="Сохранить"><i class="glyphicon glyphicon-save-file"></i> Сохранить</a>' : '') +
                              '</div>');

        this.$canvasContainer.css('background', color_rgb(curr_color_bg_r, curr_color_bg_g, curr_color_bg_b));

        redrawCursor();

        var _tmp, $lw, _i;

        // толщина кисти
        _tmp = settings.brush_width;
        $lw = this.$controls.find('.line-width');
        for (_i in _tmp) {
            if (_tmp.hasOwnProperty(_i) === false) {
                continue;
            }
            $lw.append('<option value="' + _tmp[_i] + '">' + _tmp[_i] + 'px</option>');
        }
        $lw.val(curr_line_width);

        // прозрачность кисти
        _tmp = settings.brush_opacity;
        $lw = this.$controls.find('.opacity');
        for (_i in _tmp) {
            if (_tmp.hasOwnProperty(_i) === false) {
                continue;
            }
            $lw.append('<option value="' + _tmp[_i] + '">' + _tmp[_i] + '%</option>');
        }
        $lw.val((curr_opacity * 100) >> 0);

        // СОБЫТИЯ
        $('.clear-image', this.$controls).click(function () {
            onClear();
            return false;
        });
        $('.undo', this.$controls).click(function () {
            onUndo();
            return false;
        });
        $('.redo', this.$controls).click(function () {
            onRedo();
            return false;
        });
        $('.save', this.$controls).click(function () {
            onSave();
            return false;
        });

        this.$controls.find('.line-width').change(onLineWidthChange);
        this.$controls.find('.opacity').change(onOpacityChange);

        $('a', this.$brushpicker).click(onBrushChange);

        $('body > *')
            .mousedown(onMouseDown)
            .mousemove(onMouseMove);

        $(window)
            .mouseup(onMouseUp)
            .mouseleave(onMouseOut)
            .keydown(onKeyDown);


        //noinspection SpellCheckingInspection
        this.$canvasContainer[0].addEventListener("touchstart", onCanvasTouchStart, false);

        this.modal.on('shown.bs.modal', function() {
            self.disable();
            self.modal.find('input:first').focus();
        });
        this.modal.on('hide.bs.modal', function() {
            self.enable();
            self.modal.find('#imageform-imagedata').val('');
        });

        // -----

        if (this.history === false && typeof(PaintHistory) !== 'undefined') {
            /** @type {PaintHistory} */
            this.history = new PaintHistory(getCurrentImg());
        }

        if (this.backGroundImage) {
            backGroundImageChange();
        }
    };
    /*-------------------*/

    this.changeBrush = function (brush_name) {
        if (typeof(_brushes[brush_name]) == 'undefined') {
            _brushes[brush_name] = new self.brushes[brush_name](this.context, this.contextBuffer, this.contextBuffer2);
        }
        this.brush = _brushes[brush_name];
        $('a', this.$brushpicker).removeClass('active');
        $('a[data-name=' + brush_name + ']').addClass('active');
        this.brush.reset();

        var check_selects = {'width': '.line-width', 'opacity': '.opacity'};
        for (var param in check_selects) {
            var select = null,
                max = null,
                min = null,
                max_active = 0,
                min_active = 10000;

            var selector = check_selects[param];

            select = this.$controls.find(selector);
            select.find('option').removeAttr('disabled');
            var select_val = select.val() >> 0;
            if (typeof (this.brush['max_' + param]) !== 'undefined' && this.brush['max_' + param] > 0) {
                max = this.brush['max_' + param];
                max_active = 0;
            }
            if (typeof (this.brush['min_' + param]) !== 'undefined') {
                min = this.brush['min_' + param];
                min_active = 10000;
            }
            select.find('option').each(function () {
                var val = this.value >> 0;
                if (max) {
                    if (val > max) {
                        self.disabled = 'disabled';
                    } else if (max_active < val) {
                        max_active = val;
                    }
                }
                if (min) {
                    if (val < min) {
                        self.disabled = 'disabled';
                    } else if (min_active > val) {
                        min_active = val;
                    }
                }
            });
            if (max && select_val > max) {
                select.val(max);
                select.trigger('change');
            } else if (min && select_val < min) {
                select.val(min);
                select.trigger('change');
            }
        }

        redrawCursor();
    };

    var getMouseCoord = function (e, target, _x, _y) {
        var x = _x ? _x : e.pageX;
        var y = _y ? _y : e.pageY;

        //var targetTop = target.position().top;
        var targetOffset = target.offset();
        return {x: x - targetOffset.left, y: y - targetOffset.top};
    };

    var saveBuffer = function () {
        self.contextBuffer.putImageData(
            self.context.getImageData(0, 0, settings.width, settings.height),
            0, 0);
    };

    var swapBuffer = function () {
        self.context.putImageData(
            self.contextBuffer.getImageData(0, 0, settings.width, settings.height),
            0, 0);
    };

    // var clearBuffer2 = function () {
    //     self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);
    // };
    //
    // var getBuffer2 = function () {
    //     return self.canvasBuffer2.getImageData(0, 0, settings.width, settings.height);
    // };

    var updateCursorPosition = function (coord) {
        //if (self.$canvasCursor.data('is_hidden') == false) {
        var w2 = Math.ceil(self.canvasCursor.width / 2);
        var x = coord.x - w2;
        var y = coord.y - w2;
        self.$canvasCursor.css({
            left: x,
            top:  y
        });
        //}
        //console.log('set cursor position',coord);
    };

    var redrawCursor = function () {
        var w = curr_line_width;
        var w2 = Math.ceil(self.canvasCursor.width / 2);
        var l = 6;
        var r = Math.ceil(w / 2);
        var x = w2;
        var y = w2;
        self.contextCursor.clearRect(0, 0, self.canvasCursor.width, self.canvasCursor.height);
        //setTimeout(function() {
        if (self.disabled == true) {
            self.contextCursor.beginPath();
            self.contextCursor.lineWidth = 3;
            self.contextCursor.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            self.contextCursor.moveTo(w2 - 10 + 1, w2 - 10 + 1);
            self.contextCursor.lineTo(w2 + 10 + 1, w2 + 10 + 1);
            self.contextCursor.moveTo(w2 + 10 + 1, w2 - 10 + 1);
            self.contextCursor.lineTo(w2 - 10 + 1, w2 + 10 + 1);
            self.contextCursor.lineWidth = 2;
            self.contextCursor.strokeStyle = 'rgb(255, 0, 0)';
            self.contextCursor.moveTo(w2 - 10, w2 - 10);
            self.contextCursor.lineTo(w2 + 10, w2 + 10);
            self.contextCursor.moveTo(w2 + 10, w2 - 10);
            self.contextCursor.lineTo(w2 - 10, w2 + 10);
            self.contextCursor.stroke();
            self.contextCursor.closePath();
        } else {
            self.contextCursor.beginPath();

            self.contextCursor.lineWidth = 3;
            self.contextCursor.strokeStyle = color_str(255, 255, 255, 0.5);

            self.contextCursor.moveTo(w2 - l, w2);
            self.contextCursor.lineTo(w2 + l, w2);
            self.contextCursor.moveTo(w2, w2 - l);
            self.contextCursor.lineTo(w2, w2 + l);

            self.contextCursor.stroke();

            var color_cursor_r = 255 - curr_color_bg_r;
            var color_cursor_g = 255 - curr_color_bg_g;
            var color_cursor_b = 255 - curr_color_bg_b;

            self.contextCursor.lineWidth = 1;
            self.contextCursor.strokeStyle = color_str(color_cursor_r, color_cursor_g, color_cursor_b, 0.95);

            self.contextCursor.moveTo(w2, w2 - l);
            self.contextCursor.lineTo(w2, w2 - 1);
            self.contextCursor.moveTo(w2, w2 + 1);
            self.contextCursor.lineTo(w2, w2 + l);
            self.contextCursor.moveTo(w2 - l, w2);
            self.contextCursor.lineTo(w2 - 1, w2);
            self.contextCursor.moveTo(w2 + 1, w2);
            self.contextCursor.lineTo(w2 + l, w2);

            self.contextCursor.stroke();

            self.contextCursor.closePath();

            if (r >= 4) {
                self.contextCursor.beginPath();

                self.contextCursor.lineWidth = 2;
                self.contextCursor.strokeStyle = 'rgba(255,255,255,0.35)';
                self.contextCursor.arc(x, y, r, 0, Math.PI * 2, true);
                self.contextCursor.stroke();

                self.contextCursor.lineWidth = 1;
                self.contextCursor.strokeStyle = 'rgba(0,100,100,0.85)';
                self.contextCursor.arc(x, y, r, 0, Math.PI * 2, true);
                self.contextCursor.stroke();
                self.contextCursor.closePath();
            }
        }

        //}, 50);
        //log(['redrawCursor',x, y, r, 0, Math.PI*2, true]);
    };

    var hideCursor = function () {
        self.$canvasCursor.hide(0);
        self.$canvasCursor.data('is_hidden', true);
    };
    var showCursor = function () {
        self.$canvasCursor.show(0);
        self.$canvasCursor.data('is_hidden', false);
    };

    var clearPaint = function () {
        self.context.stroke();
        self.context.clearRect(0, 0, settings.width, settings.height);
        //        self.context.fillRect(0, 0, settings.width, settings.height);

        self.contextBuffer.stroke();
        self.contextBuffer.clearRect(0, 0, settings.width, settings.height);

        self.contextBuffer2.stroke();
        self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);

        self.history.clear();
        self.history.init(getCurrentImg());
        updateUndoRedo();
    };


    /*----- СОБЫТИЯ -----*/

    var onLineWidthPlusMinus = function (action) {
        if (self.brush.name == 'simple' && self.brush.painting) {
            return;
        }
        var select = self.$controls.find('.line-width');
        var options = select.find('option:enabled');
        var sel = select.find('option:selected');
        var sel_index = options.index(sel);
        var need_index = sel_index + (action == '+' ? 1 : -1);
        if (need_index >= 0 && need_index < options.length) {
            var need = options.eq(need_index);
            if (need.length > 0) {
                select.val(need.val());
                select.trigger('change');
            }
        }
    };

    var onLineWidthChange = function () {
        var th = $(this);
        curr_line_width = th.val() >> 0;
        redrawCursor();
    };

    var onOpacityPlusMinus = function (action) {
        if (self.brush.name == 'simple' && self.brush.painting) {
            return;
        }
        var select = self.$controls.find('.opacity');
        var options = select.find('option:enabled');
        var sel = select.find('option:selected');
        var sel_index = options.index(sel);
        var need_index = sel_index + (action == '+' ? 1 : -1);
        if (need_index >= 0 && need_index < options.length) {
            var need = options.eq(need_index);
            if (need.length > 0) {
                select.val(need.val());
                select.trigger('change');
            }
        }
    };

    var onOpacityChange = function () {
        curr_opacity = (this.value >> 0) / 100.0;
    };

    var onBrushChange = function () {
        var brush_name = $(this).attr('data-name');
        self.changeBrush(brush_name);
        return false;
    };

    var onMouseDown = function (e) {
        var target = $(e.target);

        var targetTagName = e.target ? e.target.tagName.toLowerCase() : '';
        if (targetTagName != 'div' && targetTagName != 'canvas') {
            return;
        }
        if (target.hasClass('simpleColorDisplay') || target.hasClass('simpleColorContainer') || target.hasClass('simpleColorChooser') || target.hasClass('simpleColorCell')) {
            return;
        }

        var coord = getMouseCoord(e, self.$canvasContainer);

        if (coord.x < max_brush_width * -1 || coord.y < max_brush_width * -1 ||
            coord.x > settings.width + max_brush_width || coord.y > settings.height + max_brush_width) {
            // за пределами канваса
            return;
        }

        //        console.log(e);
        self.mouse.out = false;
        self.mouse.pressed = true;

        if (self.disabled == true) {
            return;
        }

        // сохраняем картинку в буффер
        if (self.brush.buffer) {
            saveBuffer();
        }

        self.brush.strokeStart(coord);
    };

    var onMouseMove = function (e) {
        var coord = getMouseCoord(e, self.$canvasContainer);

        updateCursorPosition(coord);
        self.mouse.out = false;

        if (self.mouse.pressed && self.disabled != true) {
            //console.log(e);//log(['onMouseMove', e.pageX, e.pageY]);
            self.brush.stroke(coord);
        }
    };

    var onMouseUp = function (e) {
        self.mouse.out = false;

        if (self.mouse.touched) {
            onCanvasTouchEnd(e, true);
        }

        if (self.mouse.pressed) {
            self.mouse.pressed = false;

            if (self.disabled != true) {
                var coord = getMouseCoord(e, self.$canvasContainer);

                self.brush.strokeEnd(coord);

                if (self.brush.buffered) {
                    setTimeout(function () {
                        swapBuffer();
                    }, 1);
                } else {
                    saveBuffer();
                }

                self.brush.reset();

                if (saveTimeOut) {
                    clearTimeout(saveTimeOut);
                }
                saveTimeOut = setTimeout(function () {
                    historySaveCurrent();
                    updateUndoRedo();
                }, 5);
            }
        }
        self.mouse.pressed = false;
    };

    var onMouseOut = function (e) {
        self.mouse.out = true;
        if (self.mouse.pressed) {
            //            onMouseMove(e);
            onMouseUp(e);
        }
        self.keyboard.alt = false;
        self.keyboard.shift = false;
    };

    // var onMouseIn = function (e) {
    //     if (self.mouse.pressed) {
    //         self.mouse.out = false;
    //         onMouseUp(e);
    //         onMouseDown(e);
    //     }
    // };

    var onCanvasTouchStart = function (e) {
        onCanvasTouchEnd(e, true);
        if (e.touches.length == 1) {
            showCursor();
            e.preventDefault();

            self.mouse.out = false;
            self.mouse.pressed = true;
            self.mouse.touched = true;
            if (self.disabled == true) {
                return;
            }
            // сохраняем картинку в буффер
            if (self.brush.buffer) {
                saveBuffer();
            }
            var coord = getMouseCoord(e, self.$canvasContainer, e.touches[0].pageX, e.touches[0].pageY);
            self.brush.strokeStart(coord);

            //noinspection SpellCheckingInspection
            window.addEventListener("touchmove", onCanvasTouchMove, false);
            //noinspection SpellCheckingInspection
            window.addEventListener("touchend", onCanvasTouchEnd, false)
        }
    };
    var onCanvasTouchMove = function (e) {
        if (e.touches.length == 1) {
            e.preventDefault();

            var coord = getMouseCoord(e, self.$canvasContainer, e.touches[0].pageX, e.touches[0].pageY);

            updateCursorPosition(coord);
            self.mouse.out = false;

            if ((self.mouse.pressed || self.mouse.touched) && self.disabled != true) {
                self.brush.stroke(coord);
            }
        }
    };
    //noinspection SpellCheckingInspection
    var onCanvasTouchEnd = function (e, noop) {
        if (1 == 1 || e.touches.length == 0 || noop) {
            e.preventDefault();

            self.mouse.out = false;
            if (self.mouse.pressed || self.mouse.touched) {
                self.mouse.pressed = false;
                self.mouse.touched = false;

                if (self.disabled != true) {
                    var coord = getMouseCoord(e, self.$canvasContainer, e.touches[0].pageX, e.touches[0].pageY);

                    self.brush.strokeEnd(coord);

                    if (self.brush.buffered) {
                        setTimeout(function () {
                            swapBuffer();
                        }, 1);
                    } else {
                        saveBuffer();
                    }

                    self.brush.reset();

                    if (saveTimeOut) {
                        clearTimeout(saveTimeOut);
                    }
                    saveTimeOut = setTimeout(function () {
                        historySaveCurrent();
                        updateUndoRedo();
                    }, 5);
                }
            }
            self.mouse.pressed = false;
            self.mouse.touched = false;

            //noinspection SpellCheckingInspection
            window.removeEventListener("touchmove", onCanvasTouchMove, false);
            //noinspection SpellCheckingInspection
            window.removeEventListener("touchend", onCanvasTouchEnd, false);

            hideCursor();
        }
    };

    var onClear = function () {
        if (self.disabled != true && confirm('Вы точно хотите начать рисовать с чистого листа?')) {
            clearPaint();
        }
    };

    var onUndo = function () {
        //noinspection JSUnresolvedFunction
        if (self.disabled != true && self.history.undo()) {
            historyRestoreCurrent();
            updateUndoRedo();
        }
    };

    var onRedo = function () {
        //noinspection JSUnresolvedFunction
        if (self.disabled != true && self.history.redo()) {
            historyRestoreCurrent();
            updateUndoRedo();
        }
    };

    var onKeyDown = function (e) {
        if (self.disabled === true) {
            return;
        }
        // 90 - z
        // 89 - y
        // 38 - Up
        // 40 - Down
        // ] - 221
        // [ - 219
        // Num+ - 107
        // Num- - 109
        // ' - 222
        // ; - 186
        // 1 - 49 ... 9 - 57

        // Ctrl + z
        if (e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 90) {
            onUndo();
        }

        // Ctrl + Shift + z / Ctrl + y
        if ((e.ctrlKey && !e.altKey && e.shiftKey && e.keyCode == 90) ||
            (e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 89)) {
            onRedo();
        }

        // ] / Ctrl + Num+
        if ((e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 107) || e.keyCode == 221) {
            onLineWidthPlusMinus('+');
        }

        // [ / Ctrl + Num-
        if ((e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 109) || e.keyCode == 219) {
            onLineWidthPlusMinus('-');
        }

        // '
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 222) {
            onOpacityPlusMinus('+');
        }

        // ;
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode == 186) {
            onOpacityPlusMinus('-');
        }

        // 1...9
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && (e.keyCode >= 49 && e.keyCode <= 57)) {
            var brushIndex = e.keyCode - 49;
            if (brushIndex < brushes_count) {
                var brush = self.$brushpicker.find('.brush:eq(' + brushIndex + ')');
                if (brush.length > 0) {
                    brush.trigger('click');
                }
            }
        }

        //console.log(e);
    };

    /// СОХРАНЕНИЕ КАРТИНКИ НА СЕРВЕР
    var onSave = function () {
        self.modal.find('#imageform-imagedata').val(getCanvasData());
        self.modal.modal();
        // self.saveImage();
    };

    /*----- METHODS -----*/

    this.saveImage = function () {

        debugger
        var _do = function (data) {
            $.post(settings.save_url, {
                    data: data
                },
                /**
                 * @param {{res: Object, msg: ?string, image: ?string}} json
                 */
                function (json) {
                    if (typeof(json.res) === 'undefined' || json.res != 'ok') {
                        alert(json.msg ? json.msg : 'Ошибка!')
                    } else {
                        self.current_image = json.image;
                        // fixme - доработать
                        alert('Картинка сохраненна!');
                    }
                }, 'json');
        };

        self.contextBuffer2.save();
        self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);
        self.contextBuffer2.fillStyle = color_rgb(curr_color_bg_r, curr_color_bg_g, curr_color_bg_b);
        self.contextBuffer2.fillRect(0, 0, settings.width, settings.height);

        self.contextBuffer2.drawImage(self.canvas, 0, 0);
        self.contextBuffer2.restore();

        var data = self.canvasBuffer2.toDataURL('image/jpeg');
        _do(data);

        self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);
    };

    var getCanvasData = function() {
        self.contextBuffer2.save();
        self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);
        self.contextBuffer2.fillStyle = color_rgb(curr_color_bg_r, curr_color_bg_g, curr_color_bg_b);
        self.contextBuffer2.fillRect(0, 0, settings.width, settings.height);

        self.contextBuffer2.drawImage(self.canvas, 0, 0);
        self.contextBuffer2.restore();

        var data = self.canvasBuffer2.toDataURL('image/jpeg');

        self.contextBuffer2.clearRect(0, 0, settings.width, settings.height);

        return data;
    };

    var backGroundImageChange = function () {
        if (self.backGroundImage == '') {
            self.$bgImage.css({'display': 'none'});
        } else {
            var _onload = function () {
                clearTimeout(_timer);
                // self.$bgImage.css({
                //     opacity: 1
                // });
                self.contextBuffer.drawImage(self.$bgImage[0], 0, 0, settings.width, settings.height);
                self.$bgImage.css({'display': 'none'});
                swapBuffer();
            };
            self.$bgImage.css({'display': 'block', 'opacity': 0.01});
            self.$bgImage.attr('src', '');
            self.$bgImage.one('load', _onload);
            var _timer = setTimeout(_onload, 1500);
            self.$bgImage.attr('src', self.backGroundImage);
        }
    };


    this.enable = function () {
        this.disabled = false;
        redrawCursor();
    };

    this.disable = function () {
        this.disabled = true;
        redrawCursor();
    };

    var getCurrentImg = function () {
        return self.context.getImageData(0, 0, self.canvas.width, self.canvas.height);
    };
    var historySaveCurrent = function () {
        self.history.save(getCurrentImg());
    };
    var historyRestoreCurrent = function () {
        //noinspection JSUnresolvedFunction
        self.contextBuffer.putImageData(self.history.curr(), 0, 0);
        //noinspection JSUnresolvedFunction
        self.context.putImageData(self.history.curr(), 0, 0);
    };

    function updateUndoRedo() {
        if (self.history) {
            //noinspection JSUnresolvedFunction
            $('.undo', self.$controls)[(self.history.can_undo() ? 'remove' : 'add') + 'Class']('disabled');
            //noinspection JSUnresolvedFunction
            $('.redo', self.$controls)[(self.history.can_redo() ? 'remove' : 'add') + 'Class']('disabled');
        }
    }

    /*----- BRUSHES -----*/

    // SIMPLE
    this.brushes.simple = function (_context, _buffer) {
        var self = this;

        this.name = 'simple';
        this.title = 'Карандаш';
        this.icon = 'glyphicon glyphicon-pencil';
        this.buffered = true;

        this.painting = false;

        var context = null;
        var buffer = null;
        var prevMouseX = null;
        var prevMouseY = null;
        this.points = null;
        this.count = null;

        this.reset = function () {
            //            log('Brush: reset');
            this.points = [];
            this.count = 0;
        };

        this.init = function (_context, _buffer) {
            //            log('Brush: init');
            context = _context;
            buffer = _buffer;
            this.reset();
        };

        this.initContext = function (ctx) {
            //            log('Brush: initContext');
            ctx.lineCap = curr_line_width == 1 ? "butt" : "round";
            ctx.lineJoin = curr_line_width == 1 ? "butt" : "round";
            ctx.lineWidth = curr_line_width;
            ctx.strokeStyle = color_str(curr_color_r, curr_color_g, curr_color_b, curr_opacity);
            ctx.globalCompositeOperation = curr_composite_op;
        };

        this.destroy = function () {
            //            log('Brush: destroy');
        };

        this.strokeStart = function (coord) {
            this.reset();
            //            log('Brush: strokeStart');
            prevMouseX = coord.x;
            prevMouseY = coord.y;
            this.initContext(context);
            this.painting = true;
            this.points.push(new Point2D(coord.x, coord.y));
        };
        this.stroke = function (coord) {
            //            log('stroke');
            var x = coord.x;
            var y = coord.y;

            this.points.push(new Point2D(x, y));
            this.count++;

            context.save();
            context.lineCap = curr_opacity > 0.5 ? 'round' : 'butt';
            context.lineJoin = curr_opacity > 0.5 ? 'round' : 'butt';

            context.beginPath();
            context.moveTo(prevMouseX, prevMouseY);
            context.lineTo(x, y);
            context.stroke();

            context.restore();

            prevMouseX = x;
            prevMouseY = y;
        };
        this.strokeEnd = function () {
            //            log('Brush: strokeEnd');

            this.painting = false;

            if (buffer !== null) {

                var _old_context = context;
                context = buffer;
                this.initContext(context);

                if (typeof(simplify) == 'function' && this.count > 2) {
                    console.log(this.points.length);
                    var new_points = simplify(this.points, 0.75, true);
                    //                    log('Brush: simplify: before ' + this.count + '; after ' + new_points.length);
                    console.log(new_points.length);
                    this.points = new_points;
                    this.count = new_points.length;

                    if (new_points && new_points.length > 2) {
                        //context.clearRect(0, 0, settings.width, settings.height);
                        _strokeMany(new_points);
                    } else {
                        _strokeMany(new_points);
                    }
                } else {
                    _strokeMany();
                }

                context = _old_context;
            }
            this.reset();
        };

        var _strokeMany = function (points) {
            if (!points) {
                points = self.points;
            }

            context.save();

            if (points.length < 2) {
                if (points.length > 0) {
                    context.beginPath();
                    context.moveTo(points[0].x, points[0].x);
                    context.lineTo(points[0].x + 0.51, points[0].y);
                    context.stroke();
                    context.closePath();
                }
            } else {

                context.beginPath();
                context.moveTo(points[0].x, points[0].y);
                context.lineTo((points[0].x + points[1].x) * 0.5, (points[0].y + points[1].y) * 0.5);
                var i = 0;
                while (++i < (self.count - 1)) {
                    var abs1 = Math.abs(points[i - 1].x - points[i].x) + Math.abs(points[i - 1].y - points[i].y)
                               + Math.abs(points[i].x - points[i + 1].x) + Math.abs(points[i].y - points[i + 1].y);

                    var abs2 = Math.abs(points[i - 1].x - points[i + 1].x) + Math.abs(points[i - 1].y - points[i + 1].y);

                    if (abs1 > 10 && abs2 > abs1 * 0.8) {
                        context.quadraticCurveTo(points[i].x,
                            points[i].y,
                            (points[i].x + points[i + 1].x) * 0.5,
                            (points[i].y + points[i + 1].y) * 0.5);
                        continue;
                    }
                    context.lineTo(points[i].x, points[i].y);
                    context.lineTo((points[i].x + points[i + 1].x) * 0.5, (points[i].y + points[i + 1].y) * 0.5);
                }
                context.lineTo(points[self.count - 1].x, points[self.count - 1].y);
                context.moveTo(points[self.count - 1].x, points[self.count - 1].y);
                context.stroke();
                context.closePath();

            }

            context.restore();
        };

        this.init(_context, _buffer);
    };

    // ERASER
    this.brushes.eraser = function (_context) {

        this.name = 'eraser';
        this.title = 'Стирательная резинка';
        this.icon = 'glyphicon glyphicon-erase';

        var context = null;
        var prevMouseX = null;
        var prevMouseY = null;

        this.reset = function () {
        };

        this.init = function (_context) {
            context = _context;
            this.reset();
        };

        this.initContext = function (ctx) {
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = curr_line_width;
            ctx.strokeStyle = color_str(255, 255, 255, 1.0);
            ctx.globalCompositeOperation = 'destination-out';
        };

        this.destroy = function () {
        };

        this.strokeStart = function (coord) {
            //            log('Brush: strokeStart');
            prevMouseX = coord.x;
            prevMouseY = coord.y;
            this.initContext(context);
            //context.beginPath();
        };
        this.stroke = function (coord) {
            //            log('stroke');
            var x = coord.x;
            var y = coord.y;

            context.beginPath();
            context.moveTo(prevMouseX, prevMouseY);
            context.lineTo(x, y);
            context.stroke();

            prevMouseX = x;
            prevMouseY = y;
        };
        this.strokeEnd = function () {
            context.restore()
        };
        this.init(_context);
    };

    /*****************************/

    _init.apply(this);

    return this;
};
Painter._painter_index = 0;


Point2D = function (x, y) {
    this.x = x;
    this.y = y;
    return this;
}