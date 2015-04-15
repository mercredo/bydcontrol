var BydJSON = new function(){
    var cObj = this, json = "";
    
    this.write = function(ifaceID){
        
        this.appendElement = function(cElement){
            // new line
//            cObj.br(appendTo);

            // write element
            json += '{"elementType":"' + jQuery(cElement).attr('class') + '",';
            
            // add attributes
            json += '"attributes":[';            
            
            // add element values
            var cValues = [], valueString = "";
            if(cValues = daw.guiElement[jQuery(cElement).attr('id')].currentValues){
                for(var i = 0;i < cValues.length;i++){
                    console.log("value[ " + i + "] " + cValues[i]);
                    valueString += " " + cValues[i];    
                }
                cObj.setAttributes({"value":valueString.trim()});
            }
            
//            var cValue;
//            if(daw.guiElement[jQuery(cElement).attr('id')].currentValues)
//                ((cValue = daw.guiElement[jQuery(cElement).attr('id')].currentValues[0]) && cObj.setAttributes({"value":cValue}));            
            
            json += ']';
            
            //finish
            json += '},';         
            
            return this;
        };
        
        this.setAttributes = function(attrs) {
            for(var key in attrs) {
              json += '{ "' + key + '":"' + attrs[key] + '"},';
            }
            return json = json.slice(0,-1);
        };
        
        this.parseIfaceNode = function(jqueryNode){            
            jQuery(jqueryNode).children().each(function(){
                // if element
                if(jQuery(this).hasClass('bydElement')){
                    var cHtml = jQuery(this).children().first();
                    if(jQuery(this).children().first().hasClass("knob")){
                        cObj.appendElement(cHtml);
                    }
                    else if(jQuery(this).children().first().hasClass("button")){
                        cObj.appendElement(cHtml);
                    }
                    else if(jQuery(this).children().first().hasClass("verticalSlider")){
                        cObj.appendElement(cHtml);
                    }
                    else if(jQuery(this).children().first().hasClass("horizontalSlider")){
                        cObj.appendElement(cHtml);
                    }
                    else if(jQuery(this).children().first().hasClass("xy")){
                        cObj.appendElement(cHtml);
                    }
                }                
                else if(jQuery(this).hasClass("vgroup")){
//                    cObj.br(groupParent);
//                    tabNesting+="\t";
                    console.log("appendVGroup");
                    json += '{"elementType":"vGroup","content": [';
                    
                    cObj.parseIfaceNode(this);
//                    tabNesting+="\t"; //tabspacehack for nested elements
                    json += "]},";
                }
                else if(jQuery(this).hasClass("hgroup")){
//                    cObj.br(groupParent);
//                    tabNesting+="\t";
                    console.log("appendVGroup");
                    json += '{"elementType":"hGroup","content": [';
                    
                    cObj.parseIfaceNode(this);
//                    tabNesting+="\t"; //tabspacehack for nested elements
                    json += ']},';
                }
//                br(groupParent);
            });
            json = json.slice(0,-1);
//            tabNesting = tabNesting.substr(2);            
        };
        
        this.getJSON = function(){
            console.log("##printJSON##");
            return json;
        };
        
        this.init = function(){
            json = '"interface":[';
            cObj.parseIfaceNode(jQuery(ifaceID));
            json += ']';
            
            return this;
        };
        
        // run
        
        return (this.init().getJSON());
    };
    
    /**** parse json-file ****/
    this.parse = function(json){
        var parseObj = this;
        this.$json = null;
        this.run = function(){
            
            var cParentNode = null;
            // convert json to byd-functions
//            jQuery(this.$json.interface).each(function(key, element){
//                console.log();
//            });
//            this.$.find('iface').each(function(){
                console.log(parseObj.$json);
                console.log(parseObj.$json.byd.interface);
                cTargetHTML = '#iface0';
//                console.log(jQuery(this).html());
                parseObj.parseNode(parseObj.$json.byd.interface, cTargetHTML);
//                console.log(daw.guiElement);
//            });
        };
        
        this.getAttributes = function(attributes){
            var attrs = "{";
            var sumAttr = attributes.length;
            console.log("sumAttr: " + sumAttr);            
            if(sumAttr < 1){
                return null;
            }
            else{
                jQuery.each(attributes, function(key,value){
                    jQuery.each(value, function(k,v){
                        console.log("adding attribute " + k + " = " + v + " to list.");
                        attrs += "\"" + k + "\":\"" + v + "\",";
                    });
                })
                
            }
            
            return attrs.substring(0, attrs.length - 1) + "}";
        };
        
        this.parseNode = function(cParentNode, cTargetHTML){
            jQuery(cParentNode).each(function(i){
//                console.log("current parentNode::");
//                    console.log(this);
//                    console.log(this.elementType);
                    switch (this.elementType){
                        case "button":
                            console.log("PXML:addButton[" + "parent:" + cTargetHTML + "]");
                            iface.addButton(cTargetHTML, parseObj.getAttributes(this.attributes));
//                            iface.addButton(cTargetHTML, "{\"value\":\"" + this.value + "\"}");
                            break;
                        case "knob":
                            console.log("PXML:addKnob[" + "parent:" + cTargetHTML + "]");
                            iface.addKnob(cTargetHTML, parseObj.getAttributes(this.attributes));
//                            iface.addKnob(cTargetHTML, "{\"value\":\"" + this.value + "\"}");
                            break;
                        case "horizontalSlider":
                            console.log("PXML:addHorizontalSlider[" + "parent:" + cTargetHTML + "]");
                            iface.addHorizontalSlider(cTargetHTML, parseObj.getAttributes(this.attributes));
//                            iface.addHorizontalSlider(cTargetHTML, "{\"value\":\"" + this.value + "\"}");
                            break;
                        case "verticalSlider":
                            console.log("PXML:addVerticalSlider[" + "parent:" + cTargetHTML + "]");
                            iface.addVerticalSlider(cTargetHTML, parseObj.getAttributes(this.attributes));
//                            iface.addVerticalSlider(cTargetHTML, "{\"value\":\"" + this.value + "\"}");
                            break;
                        case "xy":
                            console.log("PXML:addXY[" + "parent:" + cTargetHTML + "]");
                            iface.addXY(cTargetHTML, parseObj.getAttributes(this.attributes));
//                            iface.addXY(cTargetHTML, "{\"value\":\"" + this.value + "\"}");
                            break;
                        case "vGroup":
                            console.log("PXML:addVGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addVGroup(cTargetHTML);
//                            console.log(jQuery(cTargetHTML).children().last().prev().attr('id'));
                            parseObj.parseNode(this.content,"#" + jQuery(cTargetHTML).children().last().prev().attr("id")); // added .prev() after vgroup-hgroup-fix (cleaner)
                            break;
                        case "hGroup":
                            console.log("PXML:addHGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addHGroup(cTargetHTML);
                            parseObj.parseNode(this.content,"#" + jQuery(cTargetHTML).children().last().prev().attr("id")); // added .prev() after vgroup-hgroup-fix (cleaner)
                            break;
                    };
               });
        };
        
        this.init = function(){
            parseObj.$json = json;
            this.run();
        };
        
        this.init();
        
    };
    
    this.check = function(json){
       var nJson;
       try
       {
           console.log('isvalidjson');
           return nJson = jQuery.parseJSON(json);           
       }
       catch(err)
       {
           console.log('invalidjson');
            return false;
       }
    };
    
};
