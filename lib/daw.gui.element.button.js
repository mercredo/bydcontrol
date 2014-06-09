/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    var elementCounter = 0;
//    daw.guiElement.button = [];
    guiElement.Button = function(){
        this.inputType = 'button';
        this.id = this.inputType + elementCounter++;
        
        daw.guiElement[this.id] = guiElement.el.obj.call(this);
        var cObj = this;
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
            // if default value overridden
            this.options.value!=false?(cObj.change(parseFloat(this.options.value)).updateGUI()):false;
        };
        
        this.createGUI = function(){
            this.$.removeClass("button");
            this.wrapperDiv = "<div class='button' id='" + this.id + "' style=''><div class='btnLook'></div></div>";
            this.$.wrap(this.wrapperDiv).hide();
            
            this.css = {"display":"inline-block","position":"relative","border": "1px solid black"};
            this.wrapperDiv = this.$.parent().parent().css(this.css);
            
            // set css-display dependent on parentType
            this._align();
        };
        
        this.updateGUI = function(){
//            console.log(this.wrapperDiv);
            if(cObj.isPressed){
                this.wrapperDiv.css('background-color', 'lightblue');
            }else{
                this.wrapperDiv.css('background-color', 'inherit');
            }            
            
        };
        
        
        //override listeners
        this._mouse = function(e){
            var mouseClick = function(e){
                
                cObj.isPressed?cObj.isPressed = false:cObj.isPressed = true;
                console.log("isPressed: " + cObj.isPressed);
//                if (cObj.isPressed == cObj.cv) return;
                cObj.change(cObj.isPressed).updateGUI();
                
                //run change-hook via object.cH()
                if (cObj.cH && (cObj.cH(cObj.isPressed) === false)) return; //TODO
            };
            
            mouseClick(e);
            
            return cObj;
        };
        
        this._touch = function(e){this._mouse(e)};
        
        this.change = function (v) {
            cObj.isPressed = cObj.cv = v;
            console.log("ButtonPressedValueCV: " + cObj.cv);
            cObj.$.val(v);
            return cObj;
        };
        
        
    };
    
    // Listener
    $.fn.dawButton = function (options) {
        return this.each(function () {
                var button = new guiElement.Button(); //instanciate object
                if(options)button.options = jQuery.parseJSON(options);   // jsonObject of options                
                button.$ = $(this); // jQuery wrapped element
                button.run();
            }
        ).parent().parent();
    };
    
})(jQuery);

