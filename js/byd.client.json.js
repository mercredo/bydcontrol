var BydJSON = new function(){
    var cObj = this, json = "";
    
    this.write = function(ifaceID){
        
        this.appendElement = function(cElement){
            // new line
//            cObj.br(appendTo);

            // write element
            json += '{"elementType":"' + $(cElement).attr('class') + '",';
            
            // add attributes
            json += '"attributes":[';            
            var cValue;((cValue = daw.guiElement[$(cElement).attr('id')].cv) && cObj.setAttributes({"value":cValue}));            
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
            $(jqueryNode).children().each(function(){
                // if element
                if($(this).hasClass('bydElement')){
                    var cHtml = $(this).children().first();
                    if($(this).children().first().hasClass("knob")){
                        cObj.appendElement(cHtml);
                    }
                    else if($(this).children().first().hasClass("button")){
                        cObj.appendElement(cHtml);
                    }
                    else if($(this).children().first().hasClass("verticalSlider")){
                        cObj.appendElement(cHtml);
                    }
                    else if($(this).children().first().hasClass("horizontalSlider")){
                        cObj.appendElement(cHtml);
                    }
                    else if($(this).children().first().hasClass("xy")){
                        cObj.appendElement(cHtml);
                    }
                }                
                else if($(this).hasClass("vgroup")){
//                    cObj.br(groupParent);
//                    tabNesting+="\t";
                    console.log("appendVGroup");
                    json += '{"elementType":"vGroup","content": [';
                    
                    cObj.parseIfaceNode(this);
//                    tabNesting+="\t"; //tabspacehack for nested elements
                    json += "]},";
                }
                else if($(this).hasClass("hgroup")){
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
            cObj.parseIfaceNode($(ifaceID));
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
//            console.log(this.$.children().first());
//            console.log(this.$.children().find("version").text() + ">>>");
            
            var cParentNode = null;
            // convert json to byd-functions
//            $(this.$json.interface).each(function(key, element){
//                console.log();
//            });
//            this.$.find('iface').each(function(){
                console.log(parseObj.$json.byd.interface);
                cTargetHTML = '#iface0';
//                console.log($(this).html());
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
                $.each(attributes[0], function(k,v){
                    console.log("adding attribute " + k + " = " + v + " to list.");
                    attrs += "\"" + k + "\":\"" + v + "\",";
                });
            }
            
            return attrs.substring(0, attrs.length - 1) + "}";
        };
        
        this.parseNode = function(cParentNode, cTargetHTML){
            $(cParentNode).each(function(i){
                console.log("current parentNode::");
                    console.log(this);
                    console.log(this.elementType);
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
//                            console.log($(cTargetHTML).children().last().attr('id'));
                            parseObj.parseNode(this.content,"#" + $(cTargetHTML).children().last().attr("id"));
                            break;
                        case "hGroup":
                            console.log("PXML:addHGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addHGroup(cTargetHTML);
                            parseObj.parseNode(this.content,"#" + $(cTargetHTML).children().last().attr("id"));
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
           return nJson = $.parseJSON(json);           
       }
       catch(err)
       {
           console.log('invalidjson');
            return false;
       }
    };
    
};