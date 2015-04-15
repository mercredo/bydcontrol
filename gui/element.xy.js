(function($){
    var elementCounter = 0;
//    daw.guiElement.xy = [];
    guiElement.XY = function(){        
        this.inputType = 'xy';
        this.id = this.inputType + elementCounter++;
                
        // call and add object to guiElementList
        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        
        var cObj = this;                
//        this.options.address = this.id;
        
        var handleHeight = 2; // in px        
        
        this.extend = function () {
            this.options = $.extend(
                {
                    width : this.$.data('width') || 250,
                    height : this.$.data('height') || 150
                }, this.options
            );
        };        
        
        
        // last called function
        this.init = function(){
            // add customized attributes for editable element properties
            cObj.editableAttrs = {"address":this.options.address};
            // if default value overridden
            if(this.options.value!=false){
                var values = this.options.value.split(" ");
                cObj.mouseX = values[0], cObj.mouseY = values[1];
                cObj.change(values).updateGUI();
            }
        };
        
        this.createGUI = function(){
            this.$.removeClass("xy");    
            this.wrapperDiv = "<div class='xy' id='" + this.id + "' style=''>"+
                    "<div class='xyarea'><div class='ptarea' style='position:absolute;top:0;width:0;height:0;border:0px solid grey;background-color:#ccd8bc;'>"+
                    "<div class='pt' style='width:4px;height:4px;position:absolute;right:-2px;bottom:-2px;background-color:black;'></div>"+
                    "</div></div></div>";
            this.$.wrap(this.wrapperDiv).hide();
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black","background-color":"#eeeeee","margin":"auto"};
            this.wrapperDiv = this.$.parent().parent().parent().parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
            $(this.wrapperDiv).find('.ptarea').first().css({"height":cObj.currentValues[1],"width":cObj.currentValues[0]});
        };
        
        
        
        //override listeners
        this._mouse = function(e){
            
            var mouseMove = function (e) {
                var v = [];
                v = cObj._calcVal(e.pageX, e.pageY);
//                var xPos = cObj.mouseX = parseFloat(e.pageX) - cObj.x,
//                    yPos = cObj.mouseY = parseFloat(e.pageY) - cObj.y;
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(v) === false)) return;
                cObj.change(v).updateGUI();
                
            };
            
            //onfirstclick
            mouseMove(e);
            
            $(document)
                .bind('mousemove.xy',mouseMove)
                .bind('mouseup.xy',function(e){
                    $(document).unbind('mousemove.xy');
                });
            
            return cObj;
        };
        
        this._touch = function(e){
            
            var touchMove = function (e) {
                var v = [];
//                alert("TouchX: " + e.originalEvent.touches[cObj.touchIndex].pageX);
                v = cObj._calcVal(e.originalEvent.touches[cObj.touchIndex].pageX, e.originalEvent.touches[cObj.touchIndex].pageY);
                
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(v) === false)) return;
                
                cObj.change(v).updateGUI();
            };
            
//            alert(daw.guiElement.el.events.touch(e));
            // get touches index
            this.touchIndex = guiElement.el.events.touch(e);
            
            //onfirsttouch
            touchMove(e);
            
            $(document)
                .bind('touchmove.xy',touchMove)
                .bind('touchend.xy',function(e){
                    $(document).unbind('touchmove.xy');
                });
            
            return cObj;
        };
        
        this._calcVal = function(mouseX, mouseY){
            var values = [];
            var xPos = cObj.mouseX = parseFloat(mouseX) - cObj.x,
                yPos = cObj.mouseY = parseFloat(mouseY) - cObj.y;
            if(xPos < 0)cObj.mouseX = 0;if(xPos > parseFloat(cObj.options.width-handleHeight))cObj.mouseX = cObj.options.width-handleHeight;
            if(yPos < 0)cObj.mouseY = 0;if(yPos > parseFloat(cObj.options.height-handleHeight))cObj.mouseY = cObj.options.height-handleHeight;
            
            values[0] = cObj.mouseX;
            values[1] = cObj.mouseY;
            
//            return cObj.mouseX + " " + cObj.mouseY;
            return values;
        };
        
        this.change = function (v) {
            cObj.currentValues = v;
            return cObj;
        };
        
        
    };
    
    // Listener
    $.fn.dawXY = function (options, callback) {
        return this.each(function () {
                var xy = new guiElement.XY(); //instanciate object
                // if options parsed (from file, ...)
                if(options)xy.options = jQuery.parseJSON(options);   // jsonObject of options
                
                xy.$ = $(this); // jQuery wrapped element
                xy.run(callback);
            }
        ).parent().parent().parent().parent();
    };
    
})(jQuery);

