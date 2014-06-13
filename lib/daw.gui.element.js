/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var daw = {};
daw.guiElement = {}; // only important for accessing all added elements

guiElement = new function(){    
    "use strict";
    
    this.el = {};    
    
    this.el.events = {};
    this.el.events.touch = function (e) {
        return e.originalEvent.touches.length - 1;
    };
    
    this.el.obj = function(){
//        var instance = {};
        var currentElementObject = this;
//        console.log("object called!");
        this.options = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.canvas = null; //processed canvas
        this.$canvas = null; //jquery canvas-element
//        this.parentType = null;
//        this.parentGroup = null;
        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement
        this.v = null; // value ; mixed array or integer
        this.cv = null; // change value ; not commited value
        this.x = 0; // element x position
        this.y = 0; // element y position
        this.mouseX = null;
        this.mouseY = null;
        this.relativeWidth = false;
        this.relativeHeight = false;
        this.wrapperDiv = null;
        this.cH = null; // change hook
        this.eH = null; // cancel/exit hook
        this.rH = null; // release hook
        this.dH = null; // draw-Hookch
        
        this.objectTypeCount = 0;
        
        //start the action (called by extended Slide()-object)
        this.run = function(){
//            var cf = function (e, conf) {
//                var k;
//                for (k in conf) {
//                    s.o[k] = conf[k];
//                }
//                s._carve().init();
//                s._configure();
//            };
            
            //calls function from childElement (slider, knob, button, xy)
            this.extend();
            //extends options
            this.options = $.extend(
                {
                    // Config &&
                    // Capture input-attr
                    min : this.$.data('min') || 0,
                    max : this.$.data('max') || 100,
                    stopper : true,
                    readOnly : this.$.data('readonly') || (this.$.attr('readonly') === 'readonly'),
                    value : this.$.data('value') || false,
                    width : this.$.data('width') || 40,
                    height : this.$.data('height') || 200,
                    displayInput : this.$.data('displayinput') == null || this.$.data('displayinput'),
                    orientation : this.$.data('orientation') || 'vertical',
                    parentType : this.$.data('parent') || null, // TODO: parentType is not really an option!!!

                    // Hooks
                    draw : null, // function () {}
                    change : null, // function (value) {}
                    cancel : null, // function () {}
                    release : null // function (value) {}
                }, this.options
            );
                
            // input = integer
                this.i = this.$;
                this.v = this.$.val();
                //if value empty
                (this.v === '') && (this.v = this.options.min);
                
                this.$.bind(
                    'change blur'
                    , function () {        
                        console.log("slider value changed::" + currentElementObject.$.val());
//                        s.val(s._validate(s.$.val()));
                            
                    }
                );
                    
                // show or hide input-field
                (!this.options.displayInput) && this.$.hide();
                
                // constructor for element-class
                this.construct();
                // build up htmlStruct
                this.createGUI();                
                
                // detects relative width / height
                this.relativeWidth = ((this.options.width % 1 !== 0) &&
                    this.options.width.indexOf('%'));
                this.relativeHeight = ((this.options.height % 1 !== 0) &&
                    this.options.height.indexOf('%'));
                this.relative = (this.relativeWidth || this.relativeHeight);
                
                // computes size and carves the component
                this._carve();
                // finalize init
                this._listen()._configure().init();
                
        };

        this._degToRad = function(degree){
            return degree*(Math.PI/180);
        };
        
        this._checkCanvas = function() {
            // excanvas.js-stuff
            if (typeof G_vmlCanvasManager !== 'undefined') {
              G_vmlCanvasManager.initElement(this.$canvas[0]);
            }

            // check if canvas
            this.canvas = this.$canvas[0].getContext ? this.$canvas[0].getContext('2d') : null;

            if (!this.canvas) {
                throw {
                    name:        "CanvasNotSupportedException",
                    message:     "Canvas not supported. Please use excanvas on IE8.0.",
                    toString:    function(){return this.name + ": " + this.message}
                }
            }

            // hdpi support
            this.scale = (window.devicePixelRatio || 1) /
                        (
                            this.canvas.webkitBackingStorePixelRatio ||
                            this.canvas.mozBackingStorePixelRatio ||
                            this.canvas.msBackingStorePixelRatio ||
                            this.canvas.oBackingStorePixelRatio ||
                            this.canvas.backingStorePixelRatio || 1
                        );
                            
            return this;
        };
        
        this._carve = function() {
            (this.options.canvasSize) && ((this.options.width = this.options.canvasSize) && (this.options.height = this.options.canvasSize));
            if(this.relative) {
                var w = this.relativeWidth ?
                            this.wrapperDiv.parent().width() *
                            parseInt(this.options.width) / 100 :
                            this.wrapperDiv.parent().width(),
                    h = this.relativeHeight ?
                            this.wrapperDiv.parent().height() *
                            parseInt(this.options.height) / 100 :
                            this.wrapperDiv.parent().height();
                // apply relative
                this.w = this.h = Math.min(w, h);
            } else {
                this.w = this.options.width;
                this.h = this.options.height;
            }
            // finalize div
            this.wrapperDiv.css({
                'width': this.w + 'px',
                'height': this.h + 'px'
            });
            
            return this;
        };
        
        this._mouse = function (e) {

            var mouseMove = function (e) {
                var v = currentElementObject._calcVal(e.pageX, e.pageY);
                
                if (v == currentElementObject.cv) return;

                //run change-hook via this.cH(v)
                if (currentElementObject.cH && (currentElementObject.cH(v) === false)) return;

                currentElementObject.change(v).updateGUI();
            };

            // First click
            mouseMove(e);
            
            

            // Mouse events listeners
            $(document)
                .bind("mousemove.k", mouseMove)
                .bind(
                    // Escape key Listener
                    "keyup.k"
                    , function (e) {
                        if (e.keyCode === 27) {
                            $(document).unbind("mouseup.k mousemove.k keyup.k");

                            if (
                                currentElementObject.eH
                                && (currentElementObject.eH() === false)
                            ) return;

//                            s.cancel();
                        }
                    }
                )
                .bind(
                    "mouseup.k"
                    , function (e) {
                        $(document).unbind('mousemove.k mouseup.k keyup.k');
//                        currentElementObject.val(currentElementObject.cv);
                    }
                );

            return this;
        };
        
        this._touch = function (e) {

            var touchMove = function (e) {
                var v = currentElementObject._calcVal(e.originalEvent.touches[currentElementObject.touchIndex].pageX, e.originalEvent.touches[currentElementObject.touchIndex].pageY);                

                //TODO
                if (v == currentElementObject.cv) return;

                if (currentElementObject.cH && (currentElementObject.cH(v) === false)) return;

                currentElementObject.change(v).updateGUI();
//                currentElementObject.change(v);
//                s._draw();
            };

            // get touches index
            this.touchIndex = guiElement.el.events.touch(e);

            // First touch
            touchMove(e);

            // Touch events listeners
            $(document)
                .bind("touchmove.k", touchMove)
                .bind(
                    "touchend.k"
                    , function () {
                        $(document).unbind('touchmove.k touchend.k');
                        currentElementObject.val(currentElementObject.cv);
                    }
                );

            return this;
        };
        
        this._align = function(){
//            console.log("redefining css to " + this.options.parentType + "-parent");
//            console.log(this.wrapperDiv);
            (this.options.parentType == "vgroup") && (this.wrapperDiv.css({
                "display":"block"
            }));
            (this.options.parentType == "hgroup") && (this.wrapperDiv.css({
                "display":"inline-block"
            }));
        };
        
        this._xy = function () {
            var offset = $(this.wrapperDiv).offset();
            this.x = offset.left;
            this.y = offset.top;
            return this;
        };
        
        this._calcVal = function(mouseX, mouseY){
            var minVal = 0, maxVal = 127;
            var absVal = parseFloat(mouseY) - parseFloat(currentElementObject.y);            
            var relValY = (maxVal-(absVal/$(this.wrapperDiv).height()*maxVal));
            if(relValY > maxVal)return maxVal;
                else if(relValY < minVal) return minVal;
                else return relValY;
//            console.log(mouseX + " " + mouseY + " " + currentElementObject.x + " " + currentElementObject.y + "; val: " + (100-(absVal/$(this.wrapperDiv).height()*100)));
//            return relVal;
        };
        
        this._listen = function () {

            if (!this.options.readOnly) {
                $(this.wrapperDiv)
                    .bind(
                        "mousedown"
                        , function (e) {
                            e.preventDefault();
                            currentElementObject._xy()._mouse(e);
                         }
                    )
                    .bind(
                        "touchstart"
                        , function (e) {
                            e.preventDefault();
                            currentElementObject._xy()._touch(e);
                         }
                    );

//                this.listen();
            } else {
                this.$.attr('readonly', 'readonly');
            }

            if(this.relative) {
                $(window).resize(function() {
                    currentElementObject._carve()
                    .init();
//                    s._draw();
                });
            }

            return this;
        };
        
        this._configure = function () {

            // Hooks
            if (this.options.draw) this.dH = this.options.draw;
            if (this.options.change) this.cH = this.options.change;
            if (this.options.cancel) this.eH = this.options.cancel;
            if (this.options.release) this.rH = this.options.release;

//            if (this.o.displayPrevious) {
//                this.pColor = this.h2rgba(this.o.fgColor, "0.4");
//                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");
//            } else {
//                this.fgColor = this.o.fgColor;
//            }

            return this;
        };
        
        this.construct = function(){};
        this.init = function(){};
        
        // abstract reference
        this.listen = function () {}; // on start, one time
        this.extend = function () {}; // each time configure triggered
        this.change = function (v) {}; // on change
        this.createGUI = function(){};
        this.updateGUI = function(){};
     
        return this;
    };
    
};


