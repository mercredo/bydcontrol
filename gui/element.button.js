(function($){
    var elementCounter = 0;
//    daw.guiElement.button = [];
    guiElement.Button = function(){
        this.inputType = 'button';
        this.id = this.inputType + elementCounter++;
        
        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        
        var cObj = this;
//        this.options.address = this.id;
        
//        this.pressed = false;
        
        this.extend = function () {
            this.options = $.extend(
                {
                    width : this.$.data('width') || 40,
                    height : this.$.data('height') || 40,
                    value : this.$.data('pushed') || this.$.data('value') || false,
                }, this.options
            );
        };
        
        // last called function
        this.init = function(){
            // add customized attributes for editable element properties
            cObj.editableAttrs = {"address":this.options.address};
            // if default value overridden
            this.options.value!=false?(cObj.change(cObj._rangeVal(Number(new Boolean(this.options.value)))).updateGUI()):false;
        };
        
        this.createGUI = function(){
            this.$.removeClass("button");
            this.wrapperDiv = "<div class='button' id='" + this.id + "' style=''><div class='btnLook'></div></div>";
            this.$.wrap(this.wrapperDiv).hide();
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black","margin":"auto"};
            this.wrapperDiv = this.$.parent().parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
            cObj.$.val(cObj.currentValues[0]);
            
            if(cObj.isPressed){
                this.wrapperDiv.css('background-color', 'lightblue');
            }else{
                this.wrapperDiv.css('background-color', 'inherit');
            }            
            
        };
        
        
        //override listeners
        this._mouse = function(e){
            var mouseClick = function(e){
                var v = [];
                cObj.isPressed?v[0] = 0:v[0] = 1;
//                if (cObj.isPressed == cObj.cv) return;
                cObj.change(v).updateGUI();
                
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(v) === false)) return; //TODO
            };
            
            mouseClick(e);
            
            return cObj;
        };
        
        this._touch = function(e){this._mouse(e)};
        
        this.change = function (v) {
            cObj.currentValues = v;
            cObj.isPressed = cObj.cv = cObj.currentValues[0];
            
            return cObj;
        };
        
        
    };
    
    // Listener
    $.fn.dawButton = function (options, callback) {
        return this.each(function () {
                var button = new guiElement.Button(); //instanciate object
                if(options)button.options = jQuery.parseJSON(options);   // jsonObject of options                
                button.$ = $(this); // jQuery wrapped element
                button.run(callback);
            }
        ).parent().parent();
    };
    
})(jQuery);

