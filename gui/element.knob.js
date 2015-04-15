(function($){
    var elementCounter = 0;
//    daw.guiElement.xy = [];
    guiElement.Knob = function(){
        this.inputType = 'knob';
        this.id = this.inputType + elementCounter++;
        
        // call and add object to guiElementList
        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        
        var cObj = this;
//        this.options.address = this.id;
        
        this.construct = function(){                    
        
            this.startAngle = this.cAngle = this.options.startAngle;
            this.endAngle = 360 - this.startAngle;
            this.angleOffset = this.startAngle>this.endAngle?(this.startAngle - this.endAngle):(this.endAngle - this.startAngle);
            this.cAngleRad = this.startAngle*(Math.PI/180);
            this.limiter = (this.endAngle)*(Math.PI/180);
            this.radRange = 2*this.limiter, this.fullTmpRange = ((2*Math.PI)/this.radRange)*(this.options.max-this.options.min);
        };
        
        
        this.extend = function () {
            this.options = $.extend(
                {
                    canvasSize : this.$.data('size') || 75,
                    canvasShadow : this.$.data('knobshadow') || true,
                    startAngle : this.$.data('startangle') || 220,
                    canvasShadowOffsetX : 2,
                    canvasShadowOffsetY : 2,
                }, this.options
            );
        };
        
        // last called function
        this.init = function(){
            // add customized attributes for editable element properties
            cObj.editableAttrs = {"address":this.options.address, "min":this.options.min, "max":this.options.max};
            // if default value overridden
            this.options.value!=false?(cObj.change(cObj._rangeVal(parseFloat(this.options.value))).updateGUI()):false;
        };
        
        this.createGUI = function(){
            this.$.removeClass("knob");
            this.$canvas = $(document.createElement('canvas')).attr({
                width: this.options.canvasSize + 4*this.options.canvasShadowOffsetX,
                height: this.options.canvasSize +4*this.options.canvasShadowOffsetY
            }).css({"position":"absolute","left":0,"top":0});
            
            this.wrapperDiv = "<div class='knob' id='" + this.id + "' style=''>"+
                    
                    "</div>";
            this.$.wrap(this.wrapperDiv).hide();
            
            this.css = {"display":"inline-block","position":"relative","border": "0px solid black","margin":"auto"};
            this.wrapperDiv = this.$.parent().append(this.$canvas).css(this.css);
//            this.$canvas.css("padding","5px");
            
            this._checkCanvas().change([0,0])._draw();
            
            // set css-display dependent on parentType
            this._align();
            
//            this.wrapperDiv.append($(this.canvas));
        };
        
        this.updateGUI = function(){
            this._draw();
//            $(this.wrapperDiv).find('.ptarea').first().css({"height":cObj.mouseY,"width":cObj.mouseX});
        };
        
        // called from this._draw()
        this.draw = function () {
                
            this.drawKnob();
        };
        
        this.drawKnob = function(){ // TODO: onupdate only change treble; TODO: cObj.cv = null           
            var strokeOffset = 1;
            
            var range = this.options.max-this.options.min;
            this.fullTmpRange = ((2*Math.PI)/this.radRange)*range;
            
            this.canvas.beginPath();
            this.canvas.save(); // Save the state of the context
            this.canvas.fillStyle = '#f9f9f9'; // Sets the fill color
            
            this.canvas.translate(cObj.options.canvasSize/2 + strokeOffset,cObj.options.canvasSize/2 + strokeOffset);
            // rotate to current input value
            this.canvas.rotate((((cObj.cv - cObj.options.min + ((this.fullTmpRange-range)/2))/(range / this.radRange))-Math.PI));
            this.canvas.translate(-cObj.options.canvasSize/2 + strokeOffset ,-cObj.options.canvasSize/2 + strokeOffset);            
            this.canvas.shadowOffsetX = 2; // Sets the shadow offset x, positive number is right
            this.canvas.shadowOffsetY = 2; // Sets the shadow offset y, positive number is down            
            this.canvas.shadowBlur = 4; // Sets the shadow blur size
            this.canvas.shadowColor = 'rgba(0, 0, 0, 0.6)'; // Sets the shadow color
//            this.canvas.beginPath(); // Starts a shape path
            this.canvas.arc(cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2, 0, 2 * Math.PI, false); // Draws a circle                      
            this.canvas.fill(); // Fills the path
            this.canvas.closePath();
            
            this._innerCircle();            
            
            this._drawKnobMarker();
            
            if(cObj.displayValues)this._drawKnobValue();
            
            // restore saved ctx-state to prevent overdrawing
            this.canvas.restore();
        };
        
        this._innerCircle = function(displayValue){
        	var strokeOffset = 1;
            this.canvas.beginPath();
            this.canvas.fillStyle = '#404F4F'; // Sets the fill color
            this.canvas.arc(cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2 - cObj.options.canvasSize/5, 0, 2 * Math.PI, false); // Draws a circle                      
            this.canvas.fill(); // Fills the path
            this.canvas.closePath();
        };
        
        this._drawKnobValue = function(){
        	this.canvas.setTransform(1, 0, 0, 1, 0, 0);
        	this.canvas.font = "20px serif";
        	this.canvas.fillStyle = '#f9f9f9'; // Sets the fill color
        	var displayedValue = parseFloat(cObj.cv).toFixed(0);
        	var marginLeft = 0;
        	switch(displayedValue.length){
        	case 1:
        		marginLeft = 32;
        		break;
        	case 2:
        		marginLeft = 25;
        		break;
        	case 3:
        		marginLeft = 20;
        		break;
        	}
            this.canvas.fillText(displayedValue,marginLeft,47);
        };
        
        this._drawKnobMarker = function(){this.canvas.beginPath();
            this.canvas.strokeStyle = '#404F4F';
            this.canvas.moveTo(cObj.options.canvasSize/2,0);
            this.canvas.lineTo(cObj.options.canvasSize/2,cObj.options.canvasSize/4);
            this.canvas.stroke(); // stroke the knobMarkers
        };
        
//        this._drawKnobBorder = function(){
//            this.canvas.fillStyle = '#000000'; // Sets the fill color
//            this.canvas.beginPath();
//            this.canvas.arc(cObj.options.canvasSize/2-1, cObj.options.canvasSize/2-1, cObj.options.canvasSize/2+3, 0, 2 * Math.PI, false); // Draws a circle                      
//            this.canvas.fill(); // stroke the knobMarkers
//            this.canvas.closePath();
//            this.canvas.fillStyle = '#f9f9f9'; // Sets the fill color
//        };
        
        //override listeners
        this._mouse = function(e){
            
            var mouseMove = function (e) {
                var v = [];
                v = cObj.xy2val(e.pageX, e.pageY);
                
                if(cObj.cAngleRad > cObj.limiter || cObj.cAngleRad < (-1)*cObj.limiter)return;    
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(v) === false)) return; //TODO
                cObj.change(v).updateGUI();
                
            };
            
            //onfirstclick
            mouseMove(e);
            
            $(document)
                .bind('mousemove.knob',mouseMove)
                .bind('mouseup.knob',function(e){
                    $(document).unbind('mousemove.knob');
                });
            
            return cObj;
        };
        
        this._touch = function(e){
            
            var touchMove = function (e) {
                var v = [];
                v = cObj.xy2val(e.originalEvent.touches[cObj.touchIndex].pageX, e.originalEvent.touches[cObj.touchIndex].pageY);
                
                if(cObj.cAngleRad > cObj.limiter || cObj.cAngleRad < (-1)*cObj.limiter)return;    
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(v) === false)) return; //TODO
                cObj.change(v).updateGUI();
            };
            
            // get touches index
            this.touchIndex = guiElement.el.events.touch(e);
            
            //onfirsttouch
            touchMove(e);
            
            $(document)
                .bind('touchmove.knob',touchMove)
                .bind('touchend.knob',function(e){
                    $(document).unbind('touchmove.knob');
                });
            
            return cObj;
        };
        
        this._draw = function () {

            // canvas pre-rendering
            var d = true;

            this._clear();

            (this.dH) && (d = this.dH());

            (d !== false) && this.draw();

        };
        
        this._clear = function () {
            this.$canvas[0].width = this.$canvas[0].width;
        };
        
        this.xy2val = function (x, y) {
            var range = cObj.options.max - cObj.options.min;
            this.fullTmpRange = ((2*Math.PI)/this.radRange)*range;            
            var values = []; 

            // range(2*PI) (-1*PI to +1*PI)
            this.cAngleRad = Math.atan2(
                        x - (this.x + this.options.canvasSize/2)
                        , - (y - this.y - this.options.canvasSize/2)
                    ) - 0;
            
            values[0] = // PI*
                    // get 2*PI-range by adding PI
                    (this.cAngleRad + Math.PI) 
                    // 
                    * (range / this.radRange)
                    // eliminate outOfRange-range
                    - (this.fullTmpRange - range)/2;
//            console.log("\t" + values);
//            console.log("\t\t" + cObj._rangeVal(values));

            return cObj._rangeVal(values);
        };  
        
        this.change = function (v) {
            cObj.currentValues = v;
            cObj.cv = v[0];
            return cObj;
        };
        
        
    };
    
    // Listener
    $.fn.dawKnob = function (options, callback) {
        return this.each(function () {
                var knob = new guiElement.Knob(); //instanciate object
                if(options)knob.options = jQuery.parseJSON(options);   // jsonObject of options
                knob.$ = $(this); // jQuery wrapped element
                knob.run(callback);
            }
        ).parent();
    };
    
})(jQuery);

