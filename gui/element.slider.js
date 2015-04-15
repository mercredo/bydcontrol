(function($){

    var numVerticalSliders = 0, numHorizontalSliders = 0;
    var elementCounter = 0;
    //daw.guiElement.slider = [];
    guiElement.Slider = function(){
        //extends this.run() of s.obj
        this.inputType = "slider";  
        this.id = this.inputType + elementCounter++;

        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        
        var cObj = this;
//        this.options.address = this.id;

        this.handleHeight = 2; // in px
        

        // last called function
        this.init = function(){
            // add customized attributes for editable element properties
            cObj.editableAttrs = {"address":this.options.address, "min":this.options.min, "max":this.options.max};
            // if default value overridden
            this.options.value!=false?(cObj.change(cObj._rangeVal(parseFloat(this.options.value))).updateGUI()):false;
        };
        
        this.change = function (v) {
            cObj.currentValues = v;        
            return this;
        };
    };
    
    guiElement.Slider.Vertical = function(){
        numVerticalSliders++;
        var cObj = this;        
        guiElement.Slider.call(this);
        
        this.createGUI = function(){this.$.remove();
            this.$.removeClass(this.options.orientation + "Slider");               
            this.wrapperDiv = "<div class='" + this.options.orientation + "Slider' id='" + this.id + "' style=''>\n\
                <div class='bydSliderProgress' style='position:absolute;bottom:0;width:100%;height:" + this.$.val()/(cObj.options.max/100) + "%;border-top:2px solid black;background-color:lightblue;'></div>" +
                		"<div class='bydSliderValue' style='position:absolute;width:100%;top:4;text-align:center;text-shadow:grey 2px 1px; font-size:1.3em; color:white;'>" + "0.0" + "</div>" +
                		"</div>";

            this.$.css({"width": 0.95 * this.options.width,"position":"absolute","margin-left":"0px"}).wrap(this.wrapperDiv).hide(); //.parent().append(this.handleDiv)
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black","margin":"auto"};
            this.wrapperDiv = this.$.parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
            var range = cObj.options.max - cObj.options.min;
            this.$.val(cObj.currentValues[0]);
//            console.log(cObj.currentValues[0]);
            var height = (parseFloat(cObj.currentValues[0])-parseFloat(cObj.options.min))/(parseFloat(range)/100)-cObj.handleHeight;
//            console.log("\t"+height);
            
            
//            var positionY = cObj.currentValues[0] - cObj.options.min;
            $(this.wrapperDiv).children().first().height(height + "%");
            $(this.wrapperDiv).children().first().next().html(parseFloat(cObj.currentValues[0]).toPrecision(3));
        };
        
    };
    
    guiElement.Slider.Horizontal = function(){
        numHorizontalSliders++;
        var cObj = this;        
        guiElement.Slider.call(this);
        
        this.extend = function () {
            this.options = $.extend(
                {
                    orientation : 'horizontal',
                    height : 40,
                    width : 200
                }, this.options
            );
        };
        
        this._calcVal = function(mouseX, mouseY){
            var range = cObj.options.max - cObj.options.min;
//            var values = [];
            var absVal = parseFloat(mouseX) - parseFloat(cObj.x);
            
            var relValXRanged = (absVal/$(this.wrapperDiv).width()*range);
//            console.log("relval " + relValXRanged);
            
            return cObj._rangeVal(relValXRanged);
        };
        
        this.change = function (v) {
            cObj.currentValues = v;   
            return this;
        };
        
        this.createGUI = function(){
            this.$.removeClass(this.options.orientation + "Slider");
//                this.handleDiv = "<div class='handle' style='width:" + this.o.width + ";height:2px;background-color:black;'></div>";                
            this.wrapperDiv = "<div class='" + this.options.orientation + "Slider' id='" + this.id + "' style=''>\n\
                <div class='bydSliderProgress' style='position:absolute;left:0;height:100%;width:" + this.$.val()/(cObj.options.max/100) + "%;border-right:2px solid black;background-color:lightblue;'></div>" +
                		"<div class='bydSliderValue' style='position:absolute;right:4px;height:100%;line-height:40px;text-shadow:grey 2px 1px; font-size:1.3em; color:white;'>" + "0.0" + "</div>" +
                				"</div>";

            this.$.css({"width": "34px","height":"98%","position":"absolute","right":"0","margin-left":"0px"}).wrap(this.wrapperDiv).hide(); //.parent().append(this.handleDiv)
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black"};
            this.wrapperDiv = this.$.parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
            var range = cObj.options.max - cObj.options.min;
            this.$.val(cObj.currentValues[0]);
//            console.log(cObj.currentValues[0]);
            var width = (parseFloat(cObj.currentValues[0])-parseFloat(cObj.options.min))/(parseFloat(range)/100)-cObj.handleHeight;
//            console.log("\t"+width);
            
            $(this.wrapperDiv).children().first().width(width + "%");
            $(this.wrapperDiv).children().first().next().html(parseFloat(cObj.currentValues[0]).toPrecision(3));
        };
        
    };
    
    $.fn.dawVerticalSlider = $.fn.dawSlider = function (options, callback) {
        return this.each(function () {
                var slider = new guiElement.Slider.Vertical(); //instanciate object
                if(options)slider.options = jQuery.parseJSON(options);   // jsonObject of options
                slider.$ = $(this); // jQuery wrapped element
                slider.run(callback);
            }
        ).parent();
    };
    
    $.fn.dawHorizontalSlider = function (options, callback) {
        return this.each(function () {
                var slider = new guiElement.Slider.Horizontal(); //instanciate object
                if(options)slider.options = jQuery.parseJSON(options);   // jsonObject of options
                slider.$ = $(this); // jQuery wrapped element
                slider.run(callback);
            }
        ).parent();
    };

})(jQuery);