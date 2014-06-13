/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
console.log("loading byd.xmlparser.js");

(function($){
    var BydXMLParser = function(){
        var parseObj = this;
        this.$ = null;
        this.run = function(){
            console.log(this.$.children().first());
            console.log(this.$.children().find("version").text() + ">>>");
            
            var cParentNode = null;
            // convert xml to byd-functions
            this.$.find('iface').each(function(){
                cTargetHTML = '#iface0';
//                console.log($(this).html());
                parseObj.parseNode(this, cTargetHTML);
                console.log(daw.guiElement);
            });
        };
        
        this.parseNode = function(cParentNode, cTargetHTML){
            $(cParentNode).children().each(function(i){
                    console.log("NodeName: " + $(this)[0].nodeName);
                    console.log(iface);
                    switch ($(this)[0].nodeName){
                        case "button":
                            console.log("PXML:addButton[" + "parent:" + cTargetHTML + "]");
                            iface.addButton(cTargetHTML);
                            break;
                        case "knob":
                            console.log("PXML:addKnob[" + "parent:" + cTargetHTML + "]");
                            iface.addKnob(cTargetHTML);
                            break;
                        case "verticalSlider":
                            console.log("PXML:addVerticalSlider[" + "parent:" + cTargetHTML + "]");
                            iface.addSlider(cTargetHTML);
                            break;
                        case "xy":
                            console.log("PXML:addXY[" + "parent:" + cTargetHTML + "]");
                            iface.addXY(cTargetHTML);
                            break;
                        case "vGroup":
                            console.log("PXML:addVGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addVGroup(cTargetHTML);
//                            console.log("<<<>>><<<>>>");
//                            console.log($(cTargetHTML).children().last().attr('id'));
                            parseObj.parseNode($(this),"#" + $(cTargetHTML).children().last().attr("id"));
                            break;
                        case "hGroup":
                            console.log("PXML:addHGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addHGroup(cTargetHTML);
                            parseObj.parseNode($(this),"#" + $(cTargetHTML).children().last().attr("id"));
                            break;
                    }; 
               });
        };
        
    };
    
    $.fn.deployBydFromXML = function(){
        return this.each(function(){
            var parser = new BydXMLParser();
            parser.$ = $(this);
            parser.run();
        });
    };
    
    
})(jQuery);

