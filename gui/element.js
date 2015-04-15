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
        var currentElementObject = this;
        this.options = {}; // array of options
        this.$ = null; // jQuery wrapped element
        this.canvas = null; //processed canvas
        this.$canvas = null; //jquery canvas-element
        this.editableAttrs = {};
        this.i = null; // input, if still available
        this.v = null; // value ; mixed array or integer
        this.cv = null; // change value ; not commited value
        this.valuesString = "";
//        this.address = null;
        this.currentValues = null; // actual values when interacting
        this.currentValuesPositional = null; // values to operate the gui correctly (min, max, ...)
        this.displayValues = true; // show values or not
        this.x = 0; // element x position
        this.y = 0; // element y position
        this.mouseX = null;
        this.mouseY = null;
        this.relativeWidth = false;
        this.relativeHeight = false;
        this.wrapperDiv = null;
        // hooks
        this.cH = null; // change
        this.eH = null; // exit
        this.rH = null; // release
        this.dH = null; // draw
        
        this.objectTypeCount = 0;
        
        //start the action (called by extended element object)
        this.run = function(_callback){
            //calls function from childElement (slider, knob, button, xy)
            this.extend();
            //extends options
            var userOptions = {};
            this.options = jQuery.extend(
                {
                    // data options
                    min : this.$.data('min') || 0,
                    max : this.$.data('max') || 127,
                    step : this.$.data('step') || 1,
                    readOnly : this.$.data('readonly') || (this.$.attr('readonly') === 'readonly'),
                    address : this.$.data('address') || "/" + this.id,
                    value : this.$.data('value') || false,
                    
                    // style options
                    width : this.$.data('width') || 40,
                    height : this.$.data('height') || 200,
                    displayInput : this.$.data('displayinput') == null || this.$.data('displayinput'),
                    orientation : this.$.data('orientation') || 'vertical',
                    parentType : this.$.data('parent') || null,

                    // Event-Hooks
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
                
//                this.$.bind(
//                    'change blur'
//                    , function () {        
//                        console.log("slider value changed::" + currentElementObject.$.val());
////                        currentElementObject.val(currentElementObject._validate(currentElementObject.$.val()));
//                    }
//                );
                    
                // show or hide input-field
                (!this.options.displayInput) && this.$.hide();
                
                // optional constructor for element-class
                this.construct();
                // build up htmlStruct
                this.createGUI();                
                
//                this.options.range = this.options.max - this.options.min;
                // detects relative width / height
                this.relativeWidth = ((this.options.width % 1 !== 0) &&
                    this.options.width.indexOf('%'));
                this.relativeHeight = ((this.options.height % 1 !== 0) &&
                    this.options.height.indexOf('%'));
                this.relative = (this.relativeWidth || this.relativeHeight);
                
                // computes size and carves the component
                this._carve();
                
                this._listen()._configure().init();
                
                if(_callback)_callback(currentElementObject);
                
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
                var v = [];
                v = currentElementObject._calcVal(e.pageX, e.pageY);
                
//                if (v[0] == currentElementObject.cv) return;

                //run change-hook via this.cH(v)
                if (currentElementObject.cH && (currentElementObject.cH(v) === false)) return;

                currentElementObject.change(v).updateGUI();
            };

            // First click
            mouseMove(e);
            
            

            // Mouse events listeners
            jQuery(document)
                .bind("mousemove.k", mouseMove)
                .bind(
                    // Escape key Listener
                    "keyup.k"
                    , function (e) {
                        if (e.keyCode === 27) {
                            jQuery(document).unbind("mouseup.k mousemove.k keyup.k");

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
                        jQuery(document).unbind('mousemove.k mouseup.k keyup.k');
//                        currentElementObject.val(currentElementObject.cv);
                    }
                );

            return this;
        };
        
        this._touch = function (e) {

            var touchMove = function (e) {
                var v = [];
                v = currentElementObject._calcVal(e.originalEvent.touches[currentElementObject.touchIndex].pageX, e.originalEvent.touches[currentElementObject.touchIndex].pageY);                

//                if (v[0] == currentElementObject.cv) return;

                if (currentElementObject.cH && (currentElementObject.cH(v) === false)) return;

                currentElementObject.change(v).updateGUI();
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
                        currentElementObject.val(currentElementObject.cv); // TODO: 'undefined is not a function'
                    }
                );

            return this;
        };
        
        this._align = function(){
            (this.options.parentType == "vgroup") && (this.wrapperDiv.css({
                "display":"block"
            }));
            (this.options.parentType == "hgroup") && (this.wrapperDiv.css({
                "display":"inline-block"
            }));
        };
        
        this._xy = function () {
            var offset = jQuery(this.wrapperDiv).offset();
            this.x = offset.left;
            this.y = offset.top;
            return this;
        };
        
        this._calcVal = function(mouseX, mouseY){
            var range = currentElementObject.options.max - currentElementObject.options.min;
            var absVal = parseFloat(mouseY) - parseFloat(currentElementObject.y);
            
            this.relValYRanged = (range -(absVal/jQuery(this.wrapperDiv).height()*range));
//            console.log("\t"+this.relValYRanged);
            
            return currentElementObject._rangeVal(this.relValYRanged);
        };
        
        this._rangeVal = function(relVal){
            var range = currentElementObject.options.max - currentElementObject.options.min;
            var values = [];
            var _classify = function(singleValue){
                if(singleValue > range)return parseFloat(currentElementObject.options.max);
                else if(singleValue < 0)return parseFloat(currentElementObject.options.min);
                else return parseFloat(currentElementObject.options.min) + parseFloat(singleValue);
            };
            
            if(relVal instanceof Array){
                for(var i = 0;i < relVal.length; i++){
                    values[i] = _classify(relVal[i]);
                }                            
            }else{
                values[0] = _classify(relVal);
            }            
            return values;
        };
        
        this._listen = function () {

            if (!this.options.readOnly) {
                jQuery(this.wrapperDiv)
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
                jQuery(window).resize(function() {
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
            
            // addressing (for osc, ...)
//            if(this.options.address) this.address = this.options.address;
            if(this.options.value) this.valuesString = this.options.value.toString();    
            
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


