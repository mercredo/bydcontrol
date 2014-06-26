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

        this.maxVal = 127;
        this.handleHeight = 2; // in px

        

        // last called function
        this.init = function(){
            // if default value overridden
            this.options.value!=false?(cObj.change(parseFloat(this.options.value)).updateGUI()):false;
        };

    //        this.createGUI = function(){
    //            this.$.removeClass(this.options.orientation + "Slider");
    ////                this.handleDiv = "<div class='handle' style='width:" + this.o.width + ";height:2px;background-color:black;'></div>";                
    //            this.wrapperDiv = "<div class='" + this.options.orientation + "Slider' id='" + this.id + "' style=''>\n\
    //                <div class='bydSliderProgress' style='position:absolute;bottom:0;width:100%;height:" + this.$.val()/(maxVal/100) + "%;border-top:2px solid black;background-color:lightblue;'></div></div>";
    //
    //            this.$.css({"width": 0.9 * this.options.width,"position":"absolute","margin-left":"0px"}).wrap(this.wrapperDiv); //.parent().append(this.handleDiv)
    //            
    //            this.css = {"display":"inline-block","position":"relative","border": "1px solid black"};
    //            this.wrapperDiv = this.$.parent().css(this.css);
    //            
    //            // set css-display dependent on parentType
    //            this._align();
    //        };
    //        
    //        this.updateGUI = function(){
    //            console.log(this.cv/(maxVal/100));
    //            $(this.wrapperDiv).children().first().height(this.cv/(maxVal/100)-handleHeight + "%");
    //        };

        this.change = function (v) {
            this.cv = v;//console.log("-<-<");console.log(this.cv);
            this.$.val(v);
            return this;
        };
    };
    
    guiElement.Slider.Vertical = function(){
        numVerticalSliders++;
        var cObj = this;        
        guiElement.Slider.call(this);
        
        this.createGUI = function(){
            this.$.removeClass(this.options.orientation + "Slider");
//                this.handleDiv = "<div class='handle' style='width:" + this.o.width + ";height:2px;background-color:black;'></div>";                
            this.wrapperDiv = "<div class='" + this.options.orientation + "Slider' id='" + this.id + "' style=''>\n\
                <div class='bydSliderProgress' style='position:absolute;bottom:0;width:100%;height:" + this.$.val()/(cObj.maxVal/100) + "%;border-top:2px solid black;background-color:lightblue;'></div></div>";

            this.$.css({"width": 0.95 * this.options.width,"position":"absolute","margin-left":"0px"}).wrap(this.wrapperDiv); //.parent().append(this.handleDiv)
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black"};
            this.wrapperDiv = this.$.parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
//            console.log(cObj.maxVal);
//            console.log(this.cv/(cObj.maxVal/100));
            $(this.wrapperDiv).children().first().height(this.cv/(cObj.maxVal/100)-cObj.handleHeight + "%");
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
            var minVal = 0, maxVal = cObj.maxVal;
            var absVal = parseFloat(mouseX) - parseFloat(cObj.x);            
            var relValX = ((absVal/$(this.wrapperDiv).width()*maxVal));
            if(relValX > maxVal)return maxVal;
                else if(relValX < minVal) return minVal;
                else return relValX;
        };
        
        this.change = function (v) {
            this.cv = v;//console.log("-<-<");console.log(this.cv);
            this.$.val(this.cv);
            return this;
        };
        
        this.createGUI = function(){
            this.$.removeClass(this.options.orientation + "Slider");
//                this.handleDiv = "<div class='handle' style='width:" + this.o.width + ";height:2px;background-color:black;'></div>";                
            this.wrapperDiv = "<div class='" + this.options.orientation + "Slider' id='" + this.id + "' style=''>\n\
                <div class='bydSliderProgress' style='position:absolute;left:0;height:100%;width:" + this.$.val()/(cObj.maxVal/100) + "%;border-right:2px solid black;background-color:lightblue;'></div></div>";

            this.$.css({"width": "34px","height":"98%","position":"absolute","right":"0","margin-left":"0px"}).wrap(this.wrapperDiv); //.parent().append(this.handleDiv)
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black"};
            this.wrapperDiv = this.$.parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
            console.log(this.cv/(cObj.maxVal/100));
            $(this.wrapperDiv).children().first().width(this.cv/(cObj.maxVal/100) - cObj.handleHeight + "%"); //
        };
        
    };
    
    $.fn.dawVerticalSlider = $.fn.dawSlider = function (options) {
        return this.each(function () {
                var slider = new guiElement.Slider.Vertical(); //instanciate object
//                console.log(slider.inputType);
                if(options)slider.options = jQuery.parseJSON(options);   // jsonObject of options
                slider.$ = $(this); // jQuery wrapped element
                slider.run();
            }
        ).parent();
    };
    
    $.fn.dawHorizontalSlider = function (options) {
        return this.each(function () {
                var slider = new guiElement.Slider.Horizontal(); //instanciate object
//                console.log(slider.inputType);
                if(options)slider.options = jQuery.parseJSON(options);   // jsonObject of options
                slider.$ = $(this); // jQuery wrapped element
                slider.run();
            }
        ).parent();
    };

})(jQuery);