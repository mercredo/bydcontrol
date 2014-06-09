var BydXML = new function(){
    /**** write xml-file ****/
    this.write = function(ifaceID){
//    var data = JSON.stringify({"html":$(ifaceID).html()});
    
    var cObj = this;
    var tabNesting = "\t";
    var doc = document.implementation.createDocument(null, "xml", null) || new ActiveXObject("Microsoft.XMLDOM") || console.log("document.implemenation.createdocument/MSActiveXObject not supported!");
//    console.log("###");
//        console.log(doc);    
//        console.log("###");
        this.createElement = function(cElement, appendTo){
            // new line
            cObj.br(appendTo);
//            console.log($(cElement).attr('class'));
//            console.log(daw.guiElement[$(cElement).attr('id')].cv);
            // write element
            var element = doc.createElement($(cElement).attr('class'));
//            console.log(element);console.log(doc.documentElement);
            // add attributes
            var cValue;((cValue = daw.guiElement[$(cElement).attr('id')].cv) && cObj.setAttributes(element,{"value":cValue}));
            
            //fill element inner
            var name = doc.createTextNode($(cElement).attr('class'));
            element.appendChild(name);
            
            //append element
            appendTo.appendChild(element);         
            doc.documentElement.appendChild(appendTo);
            
            return this;
        };
        
        this.setAttributes = function(element, attrs) {
            for(var key in attrs) {
              element.setAttribute(key, attrs[key]);
            }
        }
        
        this.br = function(parent){
            parent.appendChild(doc.createTextNode("\n" + tabNesting)) || doc.documentElement.appendChild(doc.createTextNode("\n" + tabNesting));
            
            return this;
        };
        
        this.printXML = function(){
            console.log("##printXML##");
            return (new XMLSerializer()).serializeToString(doc.documentElement.childNodes[0]);
        };        
        
        
        this.parseIfaceNode = function(jqueryNode,groupParent){            
            $(jqueryNode).children().each(function(){
                // if element
                if($(this).hasClass('bydElement')){
                    var cHtml = $(this).children().first();
                    if($(this).children().first().hasClass("knob")){
    //                    br(groupParent);
                        cObj.createElement(cHtml,groupParent);
    //                    doc.documentElement.appendChild(groupParent);
                    }
                    else if($(this).children().first().hasClass("button")){
    //                    br(groupParent);
                        cObj.createElement(cHtml,groupParent);
    //                    doc.documentElement.appendChild(groupParent);
                    }
                    else if($(this).children().first().hasClass("verticalSlider")){
    //                    br(groupParent);
                        cObj.createElement(cHtml,groupParent);
    //                    doc.documentElement.appendChild(groupParent);
                    }
                    else if($(this).children().first().hasClass("horizontalSlider")){
    //                    br(groupParent);
                        cObj.createElement(cHtml,groupParent);
    //                    doc.documentElement.appendChild(groupParent);
                    }
                    else if($(this).children().first().hasClass("xy")){
    //                    br(groupParent);
                        cObj.createElement(cHtml,groupParent);
    //                    doc.documentElement.appendChild(groupParent);
                    }
                }                
                else if($(this).hasClass("vgroup")){
                    cObj.br(groupParent);
                    tabNesting+="\t";
                    console.log("createVGroup");
                    var group = doc.createElement("vGroup");
                    cObj.parseIfaceNode(this,group);
                    tabNesting+="\t"; //tabspacehack for nested elements
                    groupParent.appendChild(group);
                }
                else if($(this).hasClass("hgroup")){
                    cObj.br(groupParent);
                    tabNesting+="\t";
                    console.log("createHGroup");
                    var group = doc.createElement("hGroup");
                    cObj.parseIfaceNode(this,group);
                    tabNesting+="\t"; //tabspacehack for nested elements
                    groupParent.appendChild(group);            
                }
//                br(groupParent);
//                console.log(doc);
            });
//            br(groupParent);
            tabNesting = tabNesting.substr(2);
            
        };
        
//        this.createGroup = function(type){
//            console.log("createHGroup");
//            var group = doc.createElement("hGroup");
//            parseIfaceNode(this,group);
//            groupParent.appendChild(group);            
//        };
        
        this.init = function(){
            var rt = doc.createElement("iface");
            this.parseIfaceNode($(ifaceID),rt);
            doc.documentElement.appendChild(rt);

            return this;
        };

        // run
        return this.init().printXML();
    };
    
    
    /**** parse xml-file ****/
    this.parse = function(ifaceID){
        var parseObj = this;
        this.$ = null;
        this.run = function(){
//            console.log(this.$.children().first());
//            console.log(this.$.children().find("version").text() + ">>>");
            
            var cParentNode = null;
            // convert xml to byd-functions
            this.$.find('iface').each(function(){
                cTargetHTML = '#iface0';
//                console.log($(this).html());
                parseObj.parseNode(this, cTargetHTML);
                console.log(daw.guiElement);
            });
        };
        
        this.getAttributes = function(node){
            var attrs = "{";
            var sumAttr = node.attributes.length;
            console.log(sumAttr);
            if(sumAttr < 1){
                return null;
            }
            else{
                for (var i = 0; i < sumAttr; i++) {
                    var attr = node.attributes[i];
                    console.log("adding attribute " + attr.name + " = " + attr.value + " to list.");
                    attrs += "\"" + attr.name + "\":\"" + attr.value + "\",";
                }                
            }
            
            return attrs.substring(0, attrs.length - 1) + "}";
        };
        
        this.parseNode = function(cParentNode, cTargetHTML){
            $(cParentNode).children().each(function(i){
                    console.log("NodeName: " + $(this)[0].nodeName);
                    console.log(iface);
                    switch ($(this)[0].nodeName){
                        case "button":
                            console.log("PXML:addButton[" + "parent:" + cTargetHTML + "]");
                            iface.addButton(cTargetHTML, parseObj.getAttributes($(this)[0]));
                            break;
                        case "knob":
                            console.log("PXML:addKnob[" + "parent:" + cTargetHTML + "]");
                            iface.addKnob(cTargetHTML, parseObj.getAttributes($(this)[0]));
                            break;
                        case "horizontalSlider":
                            console.log("PXML:addHorizontalSlider[" + "parent:" + cTargetHTML + "]");
                            iface.addHorizontalSlider(cTargetHTML, parseObj.getAttributes($(this)[0]));
                            break;
                        case "verticalSlider":
                            console.log("PXML:addVerticalSlider[" + "parent:" + cTargetHTML + "]");
                            iface.addVerticalSlider(cTargetHTML, parseObj.getAttributes($(this)[0]));
                            break;
                        case "xy":
                            console.log("PXML:addXY[" + "parent:" + cTargetHTML + "]");
                            iface.addXY(cTargetHTML, parseObj.getAttributes($(this)[0]));
                            break;
                        case "vGroup":
                            console.log("PXML:addVGroup[" + "parent:" + cTargetHTML + "]");
                            iface.addVGroup(cTargetHTML);
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
        
        this.init = function(){
            this.$ = $(ifaceID);
            this.run();
        };
        
        this.init();
        
    };
    
    this.check = function(jsonXml){
        try{
            if(jQuery.isXMLDoc($.parseXML(jsonXml))){
                console.log("isvalidxml");
                return $($.parseXML(jsonXml));
            }
            else 
                return false;
        }catch(err){
            return false;
        }
    };
};