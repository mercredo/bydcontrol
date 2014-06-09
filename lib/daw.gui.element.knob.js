/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    var elementCounter = 0;
//    daw.guiElement.xy = [];
    guiElement.Knob = function(){        
        this.inputType = 'knob';
        this.id = this.inputType + elementCounter++;
        // call and add object to guiElementList
        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        var cObj = this;
        
        this.construct = function(){                    
        
            this.startAngle = this.cAngle = this.options.startAngle;
            this.endAngle = 360 - this.startAngle;
            this.angleOffset = this.startAngle>this.endAngle?(this.startAngle - this.endAngle):(this.endAngle - this.startAngle);
            this.cAngleRad = this.startAngle*(Math.PI/180);
            this.limiter = (this.endAngle)*(Math.PI/180);
            this.radRange = 2*this.limiter, this.valRange = 127, this.fullTmpRange = ((2*Math.PI)/this.radRange)*this.valRange;                    
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
            // if default value overridden
            this.options.value!=false?(cObj.change(parseFloat(this.options.value)).updateGUI()):false;
        };
        
        this.createGUI = function(){
//            console.log(this.$.data('size') + " <<<<<<<<<<<<<<<<<<<<    ");
            this.$.removeClass("knob");
            this.$canvas = $(document.createElement('canvas')).attr({
                width: this.options.canvasSize + 4*this.options.canvasShadowOffsetX,
                height: this.options.canvasSize +4*this.options.canvasShadowOffsetY
            }).css({"position":"absolute","left":0,"top":0});
            
            this.wrapperDiv = "<div class='knob' id='" + this.id + "' style=''>"+
                    
                    "</div>";
            this.$.wrap(this.wrapperDiv).hide();
            
            this.css = {"display":"inline-block","position":"relative","border": "0px solid black"};
            this.wrapperDiv = this.$.parent().append(this.$canvas).css(this.css);
//            this.$canvas.css("padding","5px");
            
            this._checkCanvas()._draw();
            
            // set css-display dependent on parentType
            this._align();
            
//            this.wrapperDiv.append($(this.canvas));
        };
        
        this.updateGUI = function(){
            this._draw();
//            $(this.wrapperDiv).find('.ptarea').first().css({"height":cObj.mouseY,"width":cObj.mouseX});
        };
        
        this.draw = function () {
                
            this.drawKnob();
        };
        
        this.drawKnob = function(){
//            console.log("draw knob");
//            console.log("with angleRad " + this.cAngleRad);
            
//            this.canvas.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
            var strokeOffset = 1;
            
            this.canvas.beginPath();
            this.canvas.save(); // Save the state of the context
            this.canvas.fillStyle = '#f9f9f9'; // Sets the fill color
            
            this.canvas.translate(cObj.options.canvasSize/2 + strokeOffset,cObj.options.canvasSize/2 + strokeOffset);
//            //this.canvas.rotate(this.cAngleRad);
            this.canvas.rotate(((this.cv + ((this.fullTmpRange-this.valRange)/2))/(this.valRange / this.radRange))-Math.PI);
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
            
            // restore saved ctx-state to prevent overdrawing
            this.canvas.restore();
        };
        
        this._innerCircle = function(){
            var strokeOffset = 1;
            this.canvas.beginPath();
            this.canvas.fillStyle = '#404F4F'; // Sets the fill color
            this.canvas.arc(cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2-strokeOffset, cObj.options.canvasSize/2 - cObj.options.canvasSize/5, 0, 2 * Math.PI, false); // Draws a circle                      
            this.canvas.fill(); // Fills the path
            this.canvas.closePath();
        };
        
        this._drawKnobMarker = function(){
            this.canvas.beginPath();
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
                var v = cObj.xy2val(e.pageX, e.pageY);
                
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
                var v = cObj.xy2val(e.originalEvent.touches[cObj.touchIndex].pageX, e.originalEvent.touches[cObj.touchIndex].pageY);
                
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

//            s.g = s.c;
//
            this._clear();

            (this.dH) && (d = this.dH());

            (d !== false) && this.draw();

        };
        
        this._clear = function () {
            this.$canvas[0].width = this.$canvas[0].width;
        };
        
        this.xy2val = function (x, y) {
            var returnVal; 

            this.cAngleRad = Math.atan2(
                        x - (this.x + this.options.canvasSize/2)
                        , - (y - this.y - this.options.canvasSize/2)
                    ) - 0;
            console.log("currentRadValue: " + this.cAngleRad);
            console.log("radLimiter: " + this.limiter);
            
            console.log("tp " + this.fullTmpRange);
            
            returnVal = (this.cAngleRad + Math.PI)*(this.valRange / this.radRange)-(this.fullTmpRange-this.valRange)/2;
            

//            if(this.cAngleArc != (2 * Math.PI) && (this.cAngleRad < 0) && (this.cAngleRad > -0.5)) {
//                // if isset angleArc option, set to min if .5 under min
//                this.cAngleRad = 0;
//            } else if (this.cAngleRad < 0) {
//                this.cAngleRad += (2 * Math.PI);
//            }

//            ret = ~~ (0.5 + (this.cAngleRad * (this.options.max - this.options.min) / this.cAngleArc))
//                    + this.options.min;
//
//            this.options.stopper && (ret = max(min(ret, this.options.max), this.options.min));

            return returnVal;
        };
        
//        this._calcVal = function(mouseX, mouseY){
//            var xPos = cObj.mouseX = parseFloat(mouseX) - cObj.x,
//                yPos = cObj.mouseY = parseFloat(mouseY) - cObj.y;
//            if(xPos < 0)cObj.mouseX = 0;if(xPos > parseFloat(cObj.options.width))cObj.mouseX = cObj.options.width;
//            if(yPos < 0)cObj.mouseY = 0;if(yPos > parseFloat(cObj.options.height))cObj.mouseY = cObj.options.height;
//            return cObj.mouseX + " " + cObj.mouseY;
//        };
        
        this.angle = function (v) {
            return (v - this.options.min) * this.angleArc / (this.options.max - this.options.min);
        };
        
        this.change = function (v) {
//            this.cAngle = 0;
//            console.log("changeVal");
            cObj.cv = v;
            return cObj;
        };
        
        
    };
    
    // Listener
    $.fn.dawKnob = function (options) {
        return this.each(function () {
                var knob = new guiElement.Knob(); //instanciate object
                if(options)knob.options = jQuery.parseJSON(options);   // jsonObject of options
                knob.$ = $(this); // jQuery wrapped element
                knob.run();
            }
        ).parent();
    };
    
})(jQuery);

