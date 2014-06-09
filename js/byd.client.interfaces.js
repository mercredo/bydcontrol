function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
};



//function getInterfaceXML(ifaceID){
////    var data = JSON.stringify({"html":$(ifaceID).html()});
//    
//    var cObj = this;
//    var tabNesting = "\t";
//    var doc = document.implementation.createDocument(null, "xml", null);
//        
//        this.createElement = function(type, appendTo){
//            br(appendTo);
////            console.log(appendTo.nodeName);
//            console.log("createElement >> " + appendTo.nodeName + " >> " + type);
////            this.br();
//            var element = doc.createElement(type);
//            var name = doc.createTextNode(type);
//            element.appendChild(name);
//            appendTo.appendChild(element);         
//            doc.documentElement.appendChild(appendTo);
//            
//            return this;
//        };
//        
//        this.br = function(parent){
//            parent.appendChild(doc.createTextNode("\n" + tabNesting)) || doc.documentElement.appendChild(doc.createTextNode("\n" + tabNesting));
//            
//            return this;
//        };
//        
//        this.printXML = function(){
//            return $(doc).find("xml").html();
//        };
//        
//        this.parseIfaceNode = function(jqueryNode,groupParent){
//            
//            $(jqueryNode).children().each(function(){
//                if($(this).hasClass('bydElement')){
//                    if($(this).children().first().hasClass("knob")){
//    //                    br(groupParent);
//                        createElement("knob",groupParent);
//    //                    doc.documentElement.appendChild(groupParent);
//                    }
//                    else if($(this).children().first().hasClass("button")){
//    //                    br(groupParent);
//                        createElement("button",groupParent);
//    //                    doc.documentElement.appendChild(groupParent);
//                    }
//                    else if($(this).children().first().hasClass("verticalSlider")){
//    //                    br(groupParent);
//                        createElement("verticalSlider",groupParent);
//    //                    doc.documentElement.appendChild(groupParent);
//                    }
//                    else if($(this).children().first().hasClass("horizontalSlider")){
//    //                    br(groupParent);
//                        createElement("horizontalSlider",groupParent);
//    //                    doc.documentElement.appendChild(groupParent);
//                    }
//                    else if($(this).children().first().hasClass("xy")){
//    //                    br(groupParent);
//                        createElement("xy",groupParent);
//    //                    doc.documentElement.appendChild(groupParent);
//                    }
//                }                
//                else if($(this).hasClass("vgroup")){
//                    br(groupParent);
//                    tabNesting+="\t";
//                    console.log("createVGroup");
//                    var group = doc.createElement("vGroup");
//                    parseIfaceNode(this,group);
//                    tabNesting+="\t"; //tabspacehack for nested elements
//                    groupParent.appendChild(group);
//                }
//                else if($(this).hasClass("hgroup")){
//                    br(groupParent);
//                    tabNesting+="\t";
//                    console.log("createHGroup");
//                    var group = doc.createElement("hGroup");
//                    parseIfaceNode(this,group);
//                    tabNesting+="\t"; //tabspacehack for nested elements
//                    groupParent.appendChild(group);            
//                }
////                br(groupParent);
//            });
////            br(groupParent);
//            tabNesting = tabNesting.substr(2);
//            
//        };
//        
////        this.createGroup = function(type){
////            console.log("createHGroup");
////            var group = doc.createElement("hGroup");
////            parseIfaceNode(this,group);
////            groupParent.appendChild(group);            
////        };
//        
//        this.parseIfaceXML = function(){
//            var rt = doc.createElement("iface");
//            parseIfaceNode($(ifaceID),rt);
//            doc.documentElement.appendChild(rt);
//            
//            return this;
//        };
//        
//        // run
//        return parseIfaceXML().printXML();
//};