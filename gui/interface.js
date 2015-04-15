buildByd = new function(){
    "use strict";
    
    this.obj = function(){
        var cObj = this;
        
        
        this.bydSocket = null;
        this.oscObj = null;
        this.guiServer = null;        
        
        
        this.wrapperDiv = null;
        this.interfaceID = null;
        this.options = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.oscActive = false;
        this.midiActive = false;
        this._oscScriptLoaded = false;
        this.nodeServerReachable = false;
        
        this.run = function(){
            this.updateSocket(jQuery('#nodejshost').val(),jQuery('#nodejsport').val());
            
            this.createGUI()._listen()._configure()._applyDesign();
            
            return this;
        };
        
        this.createGUI = function(){
            this.wrapperDiv = "<div class='interfaceWrapper'></div>";            
            this.$.wrap(this.wrapperDiv).append(cObj.cleaner());            
            this.wrapperDiv = this.$.parent();
            
            this.wrapperDiv.css({
                    "background":"none repeat scroll 0 0 #222222",
                    "border":"1px solid #444444",
                    "border-radius":"33px",
                    "overflow":"hidden",
                    "position":"relative",
                    "z-index":1,
                });
            
            return this;
        };
        
        this.saveConfig = function(e){
            this.updateSocket(jQuery('#nodejshost').val(),jQuery('#nodejsport').val());
            
            jQuery.ajax({
                type: "POST",
                url: "../services/byd.ajax.php",
                data: { nodejs: {host: jQuery('#nodejshost').val(),port: jQuery('#nodejsport').val() } }
                })
                .done(function( msg ) {
//                    alert( "Data Saved: " + msg );
            });
            
//            this.prepareOSC();
            jQuery(e).removeClass("btn-primary");
        };
        
        this.initOscServer = function(ports){
            // deploy nodejs-osc-server, add Listener to gui-elements
            cObj.bydSocket.createServer("oscServer",ports);
            cObj._listenOSC();
        };
        
        this.initGuiServer = function(ports){
            cObj.bydSocket.createServer("guiServer",ports);
            cObj.bydSocket._listen("bydGui", function(data){
                // on external input
                console.log("Receiving GUI:: \n" + data);
                                  
                var xml = "", json = "";
                if(xml = BydXML.check(data)){
                    BydXML.parse(xml);
                }else if(json = BydJSON.check(data)){
                    BydJSON.parse(json);
                }
            });
        };
        
        this.updateOSC = function(ports){
            // deploy nodejs-osc-server, add Listener to gui-elements
            cObj.bydSocket.updateServer("oscServer",ports, function(port){
                jQuery('#bt_updateConfOSC').removeClass('btn-primary');
                cObj._listenOSC();
            });            
        };
        
        this._listenOSC = function(){
            cObj.bydSocket._listen("bydOsc", function(data){
                    // on external input
                    console.log("OscInput" + data);
                    var elementID = data[0].replace("/","");
                    if(elementID in daw.guiElement){
                        console.log("elementType[" + elementID + "] available");
                        daw.guiElement[elementID].change(data[1]).updateGUI(); // TODO: if obj.size > 2                    
                    }
                });
                return this;
        };
        
        this.updateSocket = function(ip, port){
            this.bydSocket = new BydSocket(ip, port).init(function(){
                // on socket
                cObj.nodeServerReachable = true;
                
                var cfg = {
                    "oscServer":{"incomingPort":"3032", "outgoingPort":"3033"},
                    "guiServer":{"incomingPort":"4778", "outgoingPort":"4779"}
                };
                
                // start and listen for osc
                cObj.initOscServer(cfg.oscServer);
                
                // GUIServer
                cObj.initGuiServer(cfg.guiServer);
//                console.log(cObj.bydSocket.socket.connected);
//                
                // update visible server states
                cObj.updateConfigUI.all({
                    "bridge":{"ip":cObj.bydSocket.ip, "port":cObj.bydSocket.port},
                    "osc":{"incoming":cfg.oscServer.incomingPort,"outgoing":cfg.oscServer.outgoingPort},
                    "gui":{"incoming":cfg.guiServer.incomingPort,"outgoing":cfg.guiServer.outgoingPort}
                });
            }, function(){
                // on socketFail (TODO: never accessed)
                cObj.nodeServerReachable = false;
            });
        };
        
        // OSC- button listener
        this.toggleOSC = function(){
            if(cObj.nodeServerReachable)
                (!cObj.oscActive)?this.enableOSC():this.disableOSC();            
        };        
        
        this.enableOSC = function(){
            console.log("binding oscListeners...");
                // build up element-listeners
                jQuery.each(daw.guiElement, function(key,element){
                    // write new onchange-method
                    element.options.change = function(value){
                        console.log("address: " + element.options.address + "; value: " + value);
                        console.log("osc-output:: " + value);
                        cObj.bydSocket.sendOSC(element.options.address, value, function(){
             	           // display messsage in outputbar
                            jQuery('#byd-osc-out').val("/" + element.options.address + " " + value);
                        });
                    };
                    // refresh listener
                    element._configure().init();
                });
                cObj.oscActive = true;
                
                // buttondesign::toggle inactive<->active
                jQuery("#bt_enableOSC").addClass("btn-primary");
//            });
        };
        
        this.disableOSC = function(){
            jQuery.each(daw.guiElement, function(key, element){
                // remove listener
                element.options.change = function(){};                
                // refresh to empty listener
                element._configure().init();
            });
            cObj.oscActive = false;
            
            // buttondesign::toggle active<->inactive
            jQuery("#bt_enableOSC").removeClass("btn-primary");
        };
        
        
        
        this.updateConfigUI = new function(){
            this.stateBox = function(state){
                if(state.bridge){
                    console.log("updating bridgeState...");
                    jQuery('#bridgeStateValue, #bridgeAddressValue, #bridgePortValue').removeClass('offline').addClass('online').html('online');
                    jQuery('#bridgeAddressValue').html(state.bridge.ip);
                    jQuery('#bridgePortValue').html(state.bridge.port);
                }
                if(state.osc){
                    console.log("updating OSCState...");
                    jQuery('#oscStateValue').removeClass('offline').addClass('waiting').html('waiting');
                    jQuery('#oscIncomingPortValue, #oscOutgoingPortValue').removeClass('offline').addClass('online').html('online');
                    jQuery('#oscIncomingPortValue').html(state.osc.incoming);
                    jQuery('#oscOutgoingPortValue').html(state.osc.outgoing);
                }
                if(state.gui){
                    console.log("updating GUIState...");
                    jQuery('#guiStateValue').removeClass('offline').addClass('waiting').html('waiting');
                    jQuery('#guiIncomingPortValue').removeClass('offline').addClass('online').html(state.gui.incoming);
                }
                return this;
            };
            
            this.configBar = function(state){
                if(state.bridge){
                
                }
                if(state.osc){
                    jQuery('.byd-config-osc input').removeClass('form-control-invalid');
                    jQuery('.byd-config-osc-active').removeClass('hidden'); //had toggle before
                    jQuery('.byd-config-osc-inactive').addClass('hidden');
                    
                    jQuery('#oscincoming').val(state.osc.incoming);
                    jQuery('#oscoutgoing').val(state.osc.outgoing);
                }
            }            
            
            this.all = function(state){
                this.stateBox(state);
                this.configBar(state);
            }
        };
        
        /**********Editor\START**********/
        this.edit = new function(){
            var editObj = this;            
            var em_listenClick = false;
            
            editObj.editModeActive = false;
            
            // buttonListener
            this.toggleEditMode = function(){
                if(!editObj.editModeActive){
                    console.log("activating editMode...");
                    
                    editObj.startEditMode();
                    
                    //load design
                    cObj._applyDesign("editmode");
                }
                else if(editObj.editModeActive){
                    console.log("disabling editmode...");
                    
                    editObj.stopEditMode();
                    
                    // reload default design
                    cObj._applyDesign("default");
                }
            };

            var lastSelectedElement = {};
            var lastUsedGroup = {};
            this.startEditMode = function(){
//                $('#byd-btn-editmode-start .status').html("on");
    //            $("#iface0")
    //                    .bind("mouseenter.editmode", function(){
    //                console.log("editmode::mouseenter");
                    if(!editObj.editModeActive){ // runs only once per editmodesession
                        editObj.editModeActive = true;
                        //prework:listener for moving and removing element [part of modal]
                        //MODAL[Element]:: Listener
                        jQuery('#editmode-move').on("click touchend",function(e){
                        	// move element to
                            editObj.moveElement(lastSelectedElement);
                            jQuery('#modal-editmode-select-element').modal('hide');
                        });
                        jQuery('#editmode-remove').on("click touchend",function(e){
                        	// remove element
                            editObj.removeElement(lastSelectedElement.wrapperDiv);
                            jQuery('#modal-editmode-select-element').modal('hide');
                        });
                        jQuery('#editmode-select-parent-group').on('click touchend', function(e){
                        	// open group options
                            editObj.selectParentGroup(lastSelectedElement);
                            jQuery('#modal-editmode-select-element').modal('hide');
                        });
                        jQuery('#editmode-select-element-properties').on('click touchend', function(e){
                        	// open element properties
                            editObj.openElementProperties(lastSelectedElement);
                            jQuery('#modal-editmode-select-element').modal('hide');
                        });
                        jQuery('#editmode-element-properties-save').on('click touchend', function(e){
                            editObj.saveElementProperties(lastSelectedElement);                        
                            jQuery('#modal-editmode-element-properties').modal('hide');
                        });
                        
                        
                        //MODAL[Group]:: Listener
                        jQuery('#editmode-group-remove').on("click touchend", function(e){
                            editObj.removeGroup(lastSelectedElement.parentGroup);
                            jQuery('#modal-editmode-select-group').modal('hide');
                        });
                        jQuery('#editmode-group-abort, #editmode-abort').on("click touchend", function(e){
                            editObj.resetEditMode();
//                            $('#modal-editmode-select-element, #modal-editmode-select-group').modal('hide');
                        });
                        
                        // set first bind for every single guiElement
                        editObj._bindElements();
                    }
    //            })
    //                    .bind("mouseleave.editmode", function(){
    //                console.log("editmode::mouseleave");
    ////                $(this).unbind("click.editmode");
    //            })
//                        $('#iface0').css({"background-color":"#D66666"});
            };

            this.stopEditMode = function(){
                jQuery('#byd-btn-editmode-start .status').html("off");
                jQuery(cObj.interfaceID).unbind("mouseenter.editmode mouseleave.editmode").css({"background-color":"#D5D8DD"});
                editObj.editModeActive = false; //allow rebinding
                editObj._unbindElements();
            };

            this.resetEditMode = function(){
                editObj._unbindElements();
                
                jQuery.each(daw.guiGroup, function(key, element){
                    //unbind groupListener
                    console.log("remove listener for group " + element.id);
                    jQuery("#" + element.id).unbind("click.emMove");

                    //reset css
                    jQuery("#" + element.id).css(daw.guiGroup[element.id].css.default);
                });
                // reset/rebind default-listeners
                editObj._bindElements();
            };

            this._bindElements = function(){
                em_listenClick = true;
                // add clickListeners
                jQuery.each(daw.guiElement, function(key, element){
                    jQuery(element.wrapperDiv).on("click.editmode touchend.editmode", function(){
                        if(lastSelectedElement.id == element.id){
                            // prepare and open element-dialog
                            jQuery("#modal-editmode-select-element .modal-title")
                                    .html("Element: " + lastSelectedElement.id);                               
                            
                            // show moveButton, if any group available    
                            if(jQuery.isEmptyObject(daw.guiGroup)){
                                jQuery("#editmode-move").hide();
                            }else{
                                jQuery("#editmode-move").show();
                            }
                            // show parentgroupSelector, if parentgroup available    
                            if(lastSelectedElement.parentGroup == "#" + cObj.interfaceID){
                                jQuery('#editmode-select-parent-group').hide();
                            }else{
                                jQuery('#editmode-select-parent-group').show();
                            }
                            // open element-dialog
                            jQuery('#modal-editmode-select-element').modal('show');

                        }else{
                            // reset last element to default if set
                            if(lastSelectedElement.id)jQuery(lastSelectedElement.wrapperDiv).css(lastSelectedElement.css);
                            // set current as new last element
                            lastSelectedElement = element;

                            jQuery(this).css({
                            "border":"4px solid yellow",
    //                                "margin":"5px"
                            });
                        }

                    });
                });
            };

            this._unbindElements = function(){
                em_listenClick = false;
                // remove clickListeners
                jQuery.each(daw.guiElement, function(key, element){
                    jQuery(element.wrapperDiv).unbind("click.editmode touchend.editmode");
                });
                // reset last element to default if set
                if(lastSelectedElement.id)jQuery(lastSelectedElement.wrapperDiv).css(lastSelectedElement.css);
            };
            
            this._bindGroups = function(){
                
            };

            // unnecessary when using $.append()
            this.removeElement = function(div){
                if(jQuery(div).parent().hasClass('bydElement')){
                    console.log("removing element...");
                    jQuery(div).parent().remove();
                    console.log(daw.guiElement);
                }else{
                    console.log("removing failed::incorrect parent element");
                }
            };

            var cNestedParentGroup = {};
            
            this.moveElement = function(element){
                var cElement = jQuery(element.wrapperDiv).parent();
                if(cElement.hasClass('bydElement')){
                    
                    // prepare move-function
                    var moveTo = function(target){
                        console.log("i like to move it, move it.");
                        // copy element to targetGroup
                        jQuery(target).append(cElement);
                        // remove origin
    //                    cObj.removeElement(cElement); //unnecessary
                    };
                    //unbind elementListener
                    this._unbindElements();
                    // prepare marking
                    var newCss = {
                            "border":"4px solid white",
                            "background-color":"#B4E0C4",
                            "padding":"5px",
                            "cursor":"copy"
                        };
                    jQuery.each(daw.guiGroup, function(key, element){
                        var cGroup = element;
                        var targetGroup = null;
                        var possibleTargetGroups = new Array();
                        //mark groups                    
                        jQuery("#" + element.id).css(newCss)
                        // set listener for groups
                            .on("click.emMove", function(){
                                // add possible target group to array for each clicklistener
                                possibleTargetGroups.push(element);
                                targetGroup = element;
                                console.log(possibleTargetGroups);
                                
                                // targetGroup-specific changes
                                if(targetGroup.type == "vgroup"){
                                    console.log("inserting element into vgroup.");
                                    cElement.css({"float":"none"});
                                }else{
                                    cElement.css({"float":"left"});
                                }
                    
                                // hack to listen to firelistenerFinished-events 
                                // TODO: multiplies firingcount on restarteditmode() !!!!!!!!!!!!!!!
                                setTimeout(function(){
                                    console.log("display list:");
                                    console.log(possibleTargetGroups);
                                    //move Element
    //                                moveTo("#" + possibleTargetGroups[0].id);
                                    moveTo("#" + targetGroup.id);

                                },0);
                                //reset state to default
                                editObj.resetEditMode(); //runs multiple times atm for nested groups //TODO UPDATE: NEED TESTING!

                                console.log("access group [" + this.id + "]");                            
                                // calc correct input group
    //                            jQuery.each(daw.guiGroup, function(key, element){
    //                                if("#" + element.id == cGroup.parent){
    ////                                    targetGroup = 
    //                                }else{
    //                                    
    //                                }
    //                            });

                            });
                    });
                }else{
                    console.log("fail:: cannot move element [parent mismatch]");
                }
            };
            
            this.selectParentGroup = function(element){
                editObj._unbindElements();                
                
                // set if parent != iface
                if(element.parentGroup != cObj.interfaceID){
                    var newCss = {
                            "border":"4px solid white",
                            "background-color":"#B4E0C4",
                            "padding":"5px",
                            "cursor":"pointer"
                        };
                    jQuery(element.parentGroup).css(newCss);
                    jQuery('#modal-editmode-select-group').modal('show').on("hidden.bs.modal", function(){
                        editObj.resetEditMode();
                    });
                }else{
                    editObj._bindElements(); //TODO:can be removed, i think: never been fired
                }
            };
            
            this.saveElementProperties = function(element){
                // save element properties
                jQuery('#modal-editmode-element-properties .element-property').each(function(i){
                        var property = jQuery(this).html();
                        var value = jQuery(this).next().children().first().val();
                        // update property in options
                        daw.guiElement[element.id].options[property] = value;
                        // update property in editableAttrs
                        daw.guiElement[element.id].editableAttrs[property] = value;
                });     	
            };
            
            this.openElementProperties = function(element){
                // prepare elementProperties-dialog // TODO: maybe a more HTML approach
            	jQuery('#modal-editmode-element-properties .table tbody').empty();
            	jQuery.each(element.editableAttrs, function(key, value){
            		jQuery('#modal-editmode-element-properties .table tbody').append("<tr class=\"row\">" +
            				"<td class=\"col-sm-7 element-property\" style=\"vertical-align:middle;\">" + key + "</td>" +
            				"<td class=\"col-sm-5 element-value\"><input type=\"text\" value=\"" + value + "\" class=\"form-control\"/></td>" +
        				"</tr>");
            	});            	
            	
//            	editObj._unbindElements();
            	jQuery('#modal-editmode-element-properties').modal('show').on("hidden.bs.modal", function(){
                    editObj.resetEditMode();
                });
            };

            this.moveGroup = function(group){

            };

            this.removeGroup = function(group){
                // the actual removal 
                jQuery(group).remove();
                                
                var i = 0;
                jQuery.each(daw.guiGroup, function(key,element){
                    i++;
                    if( ("#" + element.id) == group ){
                        console.log(element);
                        delete daw.guiGroup[key];
//                        // quits if group found in array
//                        return false;
                    }
                });

                // remove group from selectBox
                jQuery('#cInput').children().each(function(){
                    if(jQuery(this).val() == group){
                    	if(jQuery(this).is(":selected")){
                    		// reset last added group to default
                    		cObj.cGroup = cObj.interfaceID;
                    	}
                    	// remove group
                    	jQuery(this).remove();
                    }                        
                });
                
                editObj._bindElements();
            };
            
        };
        /**********Editor\END**********/
        
        /**********LiveMode**********/
        this.live = new function(){
            var liveObj = this;
            
            liveObj.active = false;
            
            // buttonListener
            this.toggle = function(){
                if(!liveObj.active){
                    console.log("activating liveMode...");
                    
                    liveObj.start();                    
                }
                else if(liveObj.active){
                    console.log("disabling livemode...");
                    
                    liveObj.stop();
                }
            };
            
            this.start = function(){
                liveObj._hide();
                
                jQuery('#byd-btn-livemode-start .status').html("on");
                jQuery(".byd-btn-livemode").addClass("byd-btn-livemode-on");
                
                jQuery('.dawInterfaceContent').addClass("full-width");
                
                jQuery('body').addClass("stop-scrolling");
                jQuery('body').bind('touchmove', function(e){e.preventDefault()});
                
                liveObj.active = true;
            };
            
            this.stop = function(){
                liveObj._show();
                
                jQuery('#byd-btn-livemode-start .status').html("off");
                jQuery(".byd-btn-livemode").removeClass("byd-btn-livemode-on");
                
                jQuery('.dawInterfaceContent').removeClass("full-width");
                
                jQuery('body').removeClass("stop-scrolling");
                jQuery('body').unbind('touchmove');
                
                liveObj.active = false;
            };
            
            this._hide = function(){
//                $('#top, #byd-navbar-editor, .dawMenuBottom, .dawConfig, .byd-header, .col-md-1, .col-md-3').hide();
//                $('.byd-navbar-editor').hide("slow");
                jQuery('.byd-navbar-live').show("slow");                
                
                jQuery('.byd-livemode-hide').hide();
            };
            
            this._show = function(){
//                $('#top, #byd-navbar-editor, .dawMenuBottom, .dawConfig, .byd-header, .col-md-1, .col-md-3').show("slow");
//                $('.byd-navbar-editor').show("slow");
                jQuery('.byd-navbar-live').hide("slow");
                
                jQuery('.byd-livemode-hide').show();
            };
        };
        /**********LiveMode\END**********/
        
        /**********ScrollMode\START**********/
        this.scroll = new function(){
            var scrollObj = this;
            
            this.windowHeight = 0;
            this.bodyHeight = 0;
            this.scrollingDistance = 0;
            this.step = 0;
            
            this.go = function(){
                scrollObj.windowHeight = jQuery(window).height();
                scrollObj.bodyHeight = jQuery("body").height();
                
                scrollObj.step = scrollObj.windowHeight/2;
                
                return this;
            };

            this.up = function(){
                if(scrollObj.scrollingDistance - scrollObj.step > 0){
                    scrollObj.scrollingDistance -= scrollObj.step;                    
                }else{
                    scrollObj.scrollingDistance = 0;
                }                
                jQuery(window).scrollTop(scrollObj.scrollingDistance);
            };

            this.down = function(){
                if(scrollObj.scrollingDistance + scrollObj.step < scrollObj.bodyHeight){
                    scrollObj.scrollingDistance += scrollObj.step;
                    
                }else{
                    scrollObj.scrollingDistance = scrollObj.bodyHeight;
                }
                jQuery(window).scrollTop(scrollObj.scrollingDistance);
            };
        };
        /**********ScrollMode\END**********/
        
        
        this.clear = function(){
            // empty selectBox
            jQuery('#cInput').children().each(function(i){
                i>0?jQuery(this).remove():true;
            });
            
            // empty object
            daw.guiElement = {};
            daw.guiGroup = {};
            
            // set parent group iface0
            cObj.cGroup = cObj.interfaceID;
            
            // empty screen, add cleaner-div
            return this.$.html(cObj.cleaner());            
        };
        
        this.activeGroup = {};
        this._listen = function(){
            jQuery('.byd-config-nodejs input').on('change keyup',function(){
                jQuery('#bt_updateConfNodeJS').addClass('btn-primary');
            });
            jQuery('.byd-config-osc .form-control').on('change keyup',function(){
                jQuery('#bt_updateConfOSC').addClass('btn-primary');
            });
            
            jQuery('#bt_updateConfOSC').click(function(){
                console.log('updating ports initialized. sending ' + jQuery('#oscincoming').val() + ' ' + jQuery('#oscoutgoing').val());
//                cObj.bydSocket.createServer("oscServer",{"incomingPort":2020, "outgoingPort":2022});
                cObj.updateOSC({"incomingPort":jQuery('#oscincoming').val(), "outgoingPort":jQuery('#oscoutgoing').val()});
            });
//            $('#bt_updateConfOSC').tooltip('show');

//            $('#byd-bt-osc-send').click(function(){
//               console.log("TEST: <send ifacexml>");
//               console.log(ifacexml);
//               cObj.bydSocket.sendGUI(ifacexml);
//            });

            // editmode-buttonListener
            jQuery('#byd-btn-editmode-start').on('click touch', function(e){
                cObj.edit.toggleEditMode();
            });
            // editmode-buttonListener
            jQuery('.byd-btn-livemode').on('click touch', function(e){
                cObj.live.toggle();
            });
            // ScrollListeners
            jQuery('.byd-btn-scrollup').on('click touch', function(e){
                cObj.scroll.go().up();
            });
            jQuery('.byd-btn-scrolldown').on('click touch', function(e){
                cObj.scroll.go().down();
            });
            
            
            var id;     
            var lastHoveredGroup = {};
//            var resetGroupColor = function(option){
//                if((id = $(option).val()) != "#" + cObj.interfaceID){
//                    $(id).css({
//                        "background-color":"inherit",
//                    });
//                    }else{
//                        $(id).css({"background-color":cObj.cStyle.interface.backgroundColor});
//                    }
//            };
            // chrome-hack
            jQuery('#cInput').on("change.select", function(){   
            	cObj._markGroupAsActive(jQuery("option:selected",this).html());            	
            });
            // hightlighting current parent ifaceObjects
//            $('#cInput').on("click.select touch.select", function(){
//                $(this).children().each(function(i){
//                    $(this)
//                    .on("click.option touch.option",function(){
//                        if(cObj.activeGroup == "#" + cObj.interfaceID){
//                                $(cObj.activeGroup).css({"background-color":cObj.cStyle.interface.backgroundColor});
//                            }else{
//                                $(cObj.activeGroup).css({"background-color":"inherit"});
//                            }      
//                        cObj.cGroup = $(this).html();     //  id
//                        cObj.activeGroup = $(this).val(); // #id                        
//                        // if i > 0, dont mark ('cause its the interface)
//                        (i == 0) || $(cObj.activeGroup).css({"background-color":cObj.cStyle.interface.highlightColor});                                                
//                    })
//                    .on('mouseenter.option', function(){
//                        if(lastHoveredGroup == "#" + cObj.interfaceID){
//                                $(lastHoveredGroup).css({"background-color":cObj.cStyle.interface.backgroundColor});
//                            }else{
//                                $(lastHoveredGroup).css({"background-color":"inherit"});
//                            }                       
//                        
//                        lastHoveredGroup = $(this).val();
//                        // if i > 0, dont mark (cause its the interface)
//                        (i == 0) || $(lastHoveredGroup).css({"background-color":cObj.cStyle.interface.highlightColor});
//                    });
//                });
//            });            
                
            return this;
        };
        
        this._configure = function(){
            return this;
        };
        
        
        
        return this;
    };
};

(function($){
    
    var BYD = function(){
        buildByd.obj.call(this);
        
        var bydObj = this;        
        
        this.cStyle = {
            "interface":{"backgroundColor":""} // to be filled successively
        };
        
        var sumButtons = 0, sumKnobs = 0, sumSlider = 0, sumXY = 0, sumVGroup = 0, sumHGroup = 0;

        this._applyDesign = function(state){
            if(state == null || state == "" || state == "default"){
                $(".byd-btn-editmode").removeClass("byd-btn-editmode-on");                
                
                bydObj.$.css(bydObj._loadStyle("simple"));                
                
            }else if(state == "editmode"){
                $('#byd-btn-editmode-start .status').html("on");
                $(".byd-btn-editmode").addClass("byd-btn-editmode-on");
                
                bydObj.$.css(bydObj._loadStyle("edit"));
            }            
        };
        
        this._loadStyle = function(style){
            switch (style){
            case "simple":
                bydObj.cStyle.interface.backgroundColor = "#D5D8DD";
                bydObj.cStyle.interface.defaultBorder = "none";
                bydObj.cStyle.interface.defaultPadding = "0";
                bydObj.cStyle.interface.highlightColor = "#F9FAFC";
                bydObj.cStyle.interface.highlightBorder = "1px solid black";
                bydObj.cStyle.interface.highlightPadding = "5px";
                break;
            case "retro":
                break;
            case "edit":
                bydObj.cStyle.interface.backgroundColor = "#D66666";      
                bydObj.cStyle.interface.defaultBorder = "none";
                bydObj.cStyle.interface.defaultPadding = "0";
                bydObj.cStyle.interface.highlightColor = "#D69A9A";
                bydObj.cStyle.interface.highlightBorder = "1px solid black";
                bydObj.cStyle.interface.highlightPadding = "5px";
                break;                    
            }
            return {"padding":"30px 15px","background-color":bydObj.cStyle.interface.backgroundColor};            
        };

        this.gui = {};
        
        this.getTargetID = function(){
//            return $('#cInput :selected').val();
            return "#" + bydObj.cGroup;
        };
        
        this.getMembership = function(identifier){
            var p;
            !identifier && (p = "iface");
            identifier && (identifier.indexOf("iface") != -1) && (p = "iface");
            identifier && (identifier.indexOf("vgroup") != -1) && (p = "vgroup");
            identifier && (identifier.indexOf("hgroup") != -1) && (p = "hgroup");
            
            return p;
        };
        
//        this.elementWrapper = function(css){
//            return $('<div class="bydElement" style="margin:2px;' + css + ';"></div>');
//        };
        
        this.cleaner = function(){
            return jQuery('<div class="cleaner" style="float:none;clear:both;"></div>');
        }; 
        
        this._markGroupAsActive = function(groupID){
        	// reset previous active group
            if(bydObj.activeGroup == "#" + bydObj.interfaceID){
            	// if previous active group is main interface
                jQuery(bydObj.activeGroup).css({"background-color":bydObj.cStyle.interface.backgroundColor});
        	// if previous active group is hgroup/vgroup
            }else{
            	jQuery(bydObj.activeGroup).css({
            		"padding":bydObj.cStyle.interface.defaultPadding,
            		"border":bydObj.cStyle.interface.defaultBorder,
            		"background-color":"inherit"});
            }
            // save currently active group
            bydObj.cGroup = groupID;     //  id
            bydObj.activeGroup = "#" + groupID; // #id

            // hightlight currently active group if not main interface
            (bydObj.cGroup == bydObj.interfaceID) || jQuery(bydObj.activeGroup).css({
            	"padding":bydObj.cStyle.interface.highlightPadding,
            	"border":bydObj.cStyle.interface.highlightBorder,
            	"background-color":bydObj.cStyle.interface.highlightColor});
        }
        
                
//       var target;
//       this.bydElement = function(type, innerTarget){
//           var eHtml;
//           this.$.find('.cleaner').remove();
//            target = innerTarget || this.getTargetID();
//            
//            console.log("add" + type);
//            return eHtml = '<input class=\'\' data-type=\'button\' data-parent=\'' + this.getMembership(target) + '\' />';
//       };
       
       function _addElementToInterface($e, target){
           var elementWrapper = function(css){
               return jQuery('<div class="bydElement" style="margin:2px;' + css + ';"></div>');
           };
           console.log("TARGETCHILDRENLAST:");
           console.log(jQuery(target).children().last());
           return $e.appendTo(elementWrapper(bydObj.getMembership(target)!="vgroup"?"float:left;":"").insertBefore($(target).children().last()));
       };
       jQuery.fn.addBydElementTo = function(interface){
//           bydObj.$.find('.cleaner').remove();
           return _addElementToInterface(this, interface);
       };
       
       
       this.addButton = function(innerTarget, options){
           
           var target = innerTarget || this.getTargetID();
           
           console.log("addButton");
           var btnHtml = '<input class=\'\' data-type=\'button\' data-parent=\'' + this.getMembership(target) + '\' />';
           jQuery(btnHtml).dawButton(options,function(singleElement){
               // append some attributes
           	singleElement.parentGroup = target;
               // increase counter
           	sumButtons++;
           	}
           ).addBydElementTo(target);            
           
           
//           this.$.append(this.cleaner());
           
           return this;
       };
       
       this.addKnob = function(innerTarget, options){
//           this.$.find('.cleaner').remove();
           var target = innerTarget || this.getTargetID();
           console.log("addKnob");
           var knobHtml = '<input class=\'\' data-type=\'knob\' data-parent=\'' + this.getMembership(target) + '\' />';
//           jQuery(knobHtml).dawKnob().appendTo(target);            
           jQuery(knobHtml).dawKnob(options,function(singleElement){ //JSON.stringify({change:'function(v){console.log(v);}'})
//        	   console.log("NNN");console.log(singleElement.options);
               // append some attributes
           	singleElement.parentGroup = target;
               // increase counter
           	sumKnobs++;
           	}
           ).addBydElementTo(target);
           
           return this;
       };
       
       this.addSlider = function(innerTarget, options){
           this.addVerticalSlider(innerTarget, options);
       };
       
       this.addHorizontalSlider = function(innerTarget, options){
//           this.$.find('.cleaner').remove();
           var target = innerTarget || this.getTargetID();
           console.log("addHorizontalSlider");
           var sliderHtml = '<input class=\'\' data-type=\'slider\' data-parent=\'' + this.getMembership(target) + '\' />';
//           jQuery(sliderHtml).dawSlider().appendTo(target);            
           jQuery(sliderHtml).dawHorizontalSlider(options,function(singleElement){
               // append some attributes
           	singleElement.parentGroup = target;
               // increase counter
           	sumSlider++;
           	}
           ).addBydElementTo(target);
           
           return this;
       };
       
       this.addVerticalSlider = function(innerTarget, options){
//           this.$.find('.cleaner').remove();
           var target = innerTarget || this.getTargetID();
           console.log("addVerticalSlider");
           var sliderHtml = '<input class=\'\' data-type=\'slider\' data-parent=\'' + this.getMembership(target) + '\' />';
//           jQuery(sliderHtml).dawSlider().appendTo(target);            
           jQuery(sliderHtml).dawVerticalSlider(options,function(singleElement){
               // append some attributes
           	singleElement.parentGroup = target;
               // increase counter
           	sumSlider++;
           	}
           ).addBydElementTo(target);
           
           return this;
       };
       
       
       this.addXY = function(innerTarget, options){
//           this.$.find('.cleaner').remove();
           var target = innerTarget || this.getTargetID();
           console.log("addXY");
           var xyHtml = '<input class=\'\' data-type=\'xy\' data-height=\'100\' data-width=\'150\' value=\'\' data-parent=\'' + this.getMembership(target) + '\'/>';
//           $(xyHtml).dawXY().appendTo(target);            
           jQuery(xyHtml).dawXY(options,function(singleElement){
               // append some attributes
           	singleElement.parentGroup = target;
               // increase counter
           	sumXY++;
           	}
           ).addBydElementTo(target);
           
           return this;
       };
        
        daw.guiGroup = {};
        this.addVGroup = function(innerTarget){
//            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            bydObj.previousActiveGroup = bydObj.activeGroup;
            
            // init groupElement
            daw.guiGroup[bydObj.cGroup = "vgroup" + sumVGroup++] = {};
//            bydObj.activeGroup = "#" + bydObj.cGroup;
            var properties = {
                    "css":{"default":{"position":"relative","min-width":"25px", "min-height":"25px","border":"none","background-color":"inherit","padding":"0", "cursor":"inherit"}},
                    "id":bydObj.cGroup,
                    "type":"vgroup",
                    "parent":target,
                    "parentType":this.getMembership(target)
            };
            
            var vgHtml = '<div id=\'' + bydObj.cGroup + '\'  data-parent=\'' + this.getMembership(target) + '\' class=\'vgroup\' style=\'' + ((this.getMembership(target)!="vgroup")?"float:left;":"") + '\'></div>';
            
            jQuery(vgHtml).css(properties.css.default).append(this.cleaner()).insertBefore(jQuery(target).children().last());
            
            jQuery('#cInput').append("<option selected=\'selected\' value=\'" + "#" + bydObj.cGroup + "\'>" + bydObj.cGroup + "</option>");
            
            bydObj._markGroupAsActive(bydObj.cGroup);
            
            // store properties
            daw.guiGroup[bydObj.cGroup] = properties;
            daw.guiGroup[bydObj.cGroup].wrapperDiv = vgHtml;
            
            return this;
        };
        
        this.addHGroup = function(innerTarget){
//            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            bydObj.previousActiveGroup = bydObj.activeGroup;
            
            // init groupElement
            daw.guiGroup[bydObj.cGroup = "hgroup" + sumHGroup++] = {};
//            bydObj.activeGroup = "#" + bydObj.cGroup;
            var properties = {
                    "css":{"default":{"position":"relative","min-width":"25px", "min-height":"25px","border":"none","background-color":"inherit","padding":"0", "cursor":"inherit"}},
                    "id":bydObj.cGroup,
                    "type":"hgroup",
                    "parent":target,
                    "parentType":this.getMembership(target)
            };
            
            var hgHtml = '<div id=\'' + bydObj.cGroup + '\' data-parent=\'' + this.getMembership(target) + '\' class=\'hgroup\' style=\'' + ((this.getMembership(target)!="vgroup")?"float:left;":"") + '\'></div>';
//            $(hgHtml).appendTo(this.elementWrapper().appendTo(target));            
            jQuery(hgHtml).css(properties.css.default).append(this.cleaner()).insertBefore(jQuery(target).children().last());
//            this.$.append(this.cleaner());
            
//            this.cGroup = "vgroup" + sumVGroup++;
            jQuery('#cInput').append("<option selected=\'selected\' value=\'" + "#" + bydObj.cGroup + "\'>" + bydObj.cGroup + "</option>");
            
            bydObj._markGroupAsActive(bydObj.cGroup);
            
            // store properties
            daw.guiGroup[bydObj.cGroup] = properties;
            daw.guiGroup[bydObj.cGroup].wrapperDiv = hgHtml;
            
            return this;
        };
        
    };
    
// Listener
    $.fn.BYD = function (options) {
        var byd = new BYD();
        byd.interfaceID = byd.cGroup =  $(this).attr('id');
        byd.options = options;
        byd.$ = $(this);
        
        return byd.run();
    };

})(jQuery);
