buildByd = new function(){
    "use strict";
    
    this.obj = function(){
        var cObj = this;
        
        this.bydSocket = null;
        this.oscObj = null;
        this.guiServer = null;
        
        this.wrapperDiv = null;
        this.interfaceID = "iface0";
        this.options = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.oscActive = false;
        this.midiActive = false;
        this._oscScriptLoaded = false;
        this.nodeServerReachable = false;
        
        this.run = function(){
            
//            this.bydSocket = new BydSocket(ip, port).init(function(){
//                
//            });
            // prepare oscHandling
//            if(!this._oscScriptLoaded)this. _enableScriptOSC();
//            this.bydSocket = new BydSocket().init(function(){
//                console.log(cObj.bydSocket);
//                cObj.bydSocket.createServer("oscServer",{"incomingPort":"1337", "outgoingPort":"1338"})._listen("osc", function(){
//                    
//                });
//                cObj.bydSocket.createServer("guiServer",{"incomingPort":"4778", "outgoingPort":"4779"})._listen("gui", function(){
//                    
//                });
//            });
//            this.updateSocket();
            this.updateSocket($('#nodejshost').val(),$('#nodejsport').val());
            
//            this.oscObj = new OscHandler();
//            this.prepareOSC();
            
            this.createGUI()._listen()._configure()._applyDesign();
            
            return this;
        };
        
        this.createGUI = function(){
            this.wrapperDiv = "<div class='interfaceWrapper'></div>";            
            this.$.wrap(this.wrapperDiv);            
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
            this.updateSocket($('#nodejshost').val(),$('#nodejsport').val());
            
            $.ajax({
                type: "POST",
                url: "../services/byd.ajax.php",
                data: { nodejs: {host: $('#nodejshost').val(),port: $('#nodejsport').val() } }
                })
                .done(function( msg ) {
//                    alert( "Data Saved: " + msg );
            });
            
//            this.prepareOSC();
            $(e).removeClass("btn-primary");
        };
        
        this.initOscServer = function(ports){
            // deploy nodejs-osc-server, add Listener to gui-elements
//            console.log(cObj.bydSocket);
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
//                !(xml = BydXML.check(data)) || BydXML.parse(xml);
            });
        };
        
        this.updateOSC = function(ports){
            // deploy nodejs-osc-server, add Listener to gui-elements
            cObj.bydSocket.updateServer("oscServer",ports, function(port){
                $('#bt_updateConfOSC').removeClass('btn-primary');
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
//                console.log(cObj.bydSocket);
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
        
        // TODO: move somewhere else; UPDATE: deprecated
//        this._enableScriptOSC = function(){
//            console.log("enabling oscScript...");
//            var oscScript = "<script type=\"text/javascript\" src=\"../js/byd.osc.js\"></script>";
//            $("head").append($(oscScript));
//            this._oscScriptLoaded = true;
//        };
        
        // OSC- button listener
        this.toggleOSC = function(){            
            if(cObj.nodeServerReachable)
                (!cObj.oscActive)?this.enableOSC():this.disableOSC();            
        };        
        
        //UPDATE: deprecated
//        this.prepareOSC = function(){    
//            this.oscObj.init(
//            // 'conf' contains jsonConf
//              function(conf){
//                  console.log("Server reachable at " + conf.bridge.ip + ":" + conf.bridge.port);
//                  cObj.nodeServerReachable = true;
//                  cObj.updateStateBox(conf);
//            },function(e){
//                console.log("Server NOT reachable!\nException: " + e);
//                  cObj.nodeServerReachable = false;  
//            });
//        };          
        
        this.enableOSC = function(){            
            console.log("binding oscListeners...");
            //init osc-lib and add io-import            
//            this.oscObj.init(function(){
                // build up element-listeners
//                console.log(daw.guiElement);
                $.each(daw.guiElement, function(key, element){
                    // write new onchange-method
                    element.options.change = function(v){
                        console.log("osc-output:: " + v);
                        cObj.bydSocket.sendOSC(key, v, function(osc){
                            $('#byd-osc-out').val(osc);
                        });
                    };
                    // refresh listener
                    element._configure().init(); //DONE: removed '_listen()'-function to prevent overbinding
                });
                    cObj.oscActive = true;
                // buttondesign::toggle inactive<->active
                $("#bt_enableOSC").addClass("btn-primary");
//            });
        };
        
        this.disableOSC = function(){ //TODO
            cObj.oscActive = false;
            console.log("TODO:unbinding oscListeners...");
//            console.log(cObj.oscActive);
            // buttondesign::toggle active<->inactive
            $("#bt_enableOSC").removeClass("btn-primary");
        };
        
        
        
        this.updateConfigUI = new function(){
            this.stateBox = function(state){
                if(state.bridge){
                    console.log("updating bridgeState...");
                    $('#bridgeStateValue, #bridgeAddressValue, #bridgePortValue').removeClass('offline').addClass('online').html('online');
                    $('#bridgeAddressValue').html(state.bridge.ip);
                    $('#bridgePortValue').html(state.bridge.port);
                }
                if(state.osc){
                    console.log("updating OSCState...");
                    $('#oscStateValue').removeClass('offline').addClass('waiting').html('waiting');
                    $('#oscIncomingPortValue, #oscOutgoingPortValue').removeClass('offline').addClass('online').html('online');
                    $('#oscIncomingPortValue').html(state.osc.incoming);
                    $('#oscOutgoingPortValue').html(state.osc.outgoing);
                }
                if(state.gui){
                    console.log("updating GUIState...");
                    $('#guiStateValue').removeClass('offline').addClass('waiting').html('waiting');
                    $('#guiIncomingPortValue').removeClass('offline').addClass('online').html(state.gui.incoming);
                }
                return this;
            };
            
            this.configBar = function(state){
                if(state.bridge){
                
                }
                if(state.osc){
                    $('.byd-config-osc input').removeClass('form-control-invalid');
                    $('.byd-config-osc-active').removeClass('hidden'); //had toggle before
                    $('.byd-config-osc-inactive').addClass('hidden');
                    
                    $('#oscincoming').val(state.osc.incoming);
                    $('#oscoutgoing').val(state.osc.outgoing);
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
                        $('#editmode-move').on("click touchend",function(e){
                            editObj.moveElement(lastSelectedElement);
                            $('#modal-editmode-select-element').modal('hide');
                        });
                        $('#editmode-remove').on("click touchend",function(e){
                            editObj.removeElement(lastSelectedElement.wrapperDiv);
                            $('#modal-editmode-select-element').modal('hide');
                        });
                        $('#editmode-select-parent-group').on('click touchend', function(e){
                            editObj.selectParentGroup(lastSelectedElement);
                            $('#modal-editmode-select-element').modal('hide');
                        });
                        
                        //MODAL[Group]:: Listener
                        $('#editmode-group-remove').on("click touchend", function(e){
                            editObj.removeGroup(lastSelectedElement.parentGroup);
                            $('#modal-editmode-select-group').modal('hide');
                        });
                        $('#editmode-group-abort, #editmode-abort').on("click touchend", function(e){
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
                $('#byd-btn-editmode-start .status').html("off");
                $(cObj.interfaceID).unbind("mouseenter.editmode mouseleave.editmode").css({"background-color":"#D5D8DD"});
                editObj.editModeActive = false; //allow rebinding
                editObj._unbindElements();
            };

            this.resetEditMode = function(){
                editObj._unbindElements();
                
                $.each(daw.guiGroup, function(key, element){
                    //unbind groupListener
                    console.log("remove listener for group " + element.id);
                    $("#" + element.id).unbind("click.emMove");

                    //reset css
                    console.log(daw.guiGroup[element.id].css.default);
                    $("#" + element.id).css(daw.guiGroup[element.id].css.default);
                });
                // reset/rebind default-listeners
                editObj._bindElements();
            };

            this._bindElements = function(){
                em_listenClick = true;
    //            console.log("added editmodeClickListener.");
                // add clickListeners
                $.each(daw.guiElement, function(key, element){
                    $(element.wrapperDiv).on("click.editmode touchend.editmode", function(){
                        if(lastSelectedElement.id == element.id){
                            // prepare and open element-dialog
                            $("#modal-editmode-select-element .modal-title")
                                    .html("Element: " + lastSelectedElement.id);
                                
                            // show moveButton, if any group available    
                            if(jQuery.isEmptyObject(daw.guiGroup)){
                                $("#editmode-move").hide();
                            }else{
                                $("#editmode-move").show();
                            }
                            // show parentgroupSelector, if parentgroup available    
                            if(lastSelectedElement.parentGroup == "#" + cObj.interfaceID){
                                $('#editmode-select-parent-group').hide();
                            }else{
                                $('#editmode-select-parent-group').show();
                            }
                            // open element-dialog
                            $('#modal-editmode-select-element').modal('show');

                        }else{
                            // reset last element to default if set
                            if(lastSelectedElement.id)$(lastSelectedElement.wrapperDiv).css(lastSelectedElement.css);
                            // set current as new last element
                            lastSelectedElement = element;

                            $(this).css({
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
                $.each(daw.guiElement, function(key, element){
                    $(element.wrapperDiv).unbind("click.editmode touchend.editmode");
                });
                // reset last element to default if set
                if(lastSelectedElement.id)$(lastSelectedElement.wrapperDiv).css(lastSelectedElement.css);
            };
            
            this._bindGroups = function(){
                
            };

            // unnecessary when using $.append()
            this.removeElement = function(div){
                if($(div).parent().hasClass('bydElement')){
                    console.log("removing element...");
                    $(div).parent().remove();
                    console.log(daw.guiElement);
                }else{
                    console.log("removing failed::incorrect parent element");
                }
            };

            var cNestedParentGroup = {};
            
            this.moveElement = function(element){
                var cElement = $(element.wrapperDiv).parent();
                if(cElement.hasClass('bydElement')){
                    
                    // prepare move-function
                    var moveTo = function(target){
                        console.log("i like to move it, move it.");
                        // copy element to targetGroup
                        $(target).append(cElement);
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
                    $.each(daw.guiGroup, function(key, element){
                        var cGroup = element;
                        var targetGroup = null;
                        var possibleTargetGroups = new Array();
                        //mark groups                    
                        $("#" + element.id).css(newCss)
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
    //                            $.each(daw.guiGroup, function(key, element){
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
                    $(element.parentGroup).css(newCss);
                    $('#modal-editmode-select-group').modal('show').on("hidden.bs.modal", function(){
                        editObj.resetEditMode();
                    });
                }else{
                    editObj._bindElements(); //can be removed, i think: never been fired
                }
            };

            this.moveGroup = function(group){

            };

            this.removeGroup = function(group){
                // the actual removal 
                $(group).remove();
                                
                var i = 0;
                $.each(daw.guiGroup, function(key,element){
                    i++;
                    if( ("#" + element.id) == group ){
                        console.log(element);
                        delete daw.guiGroup[key];
//                        // quits if group found in array
//                        return false;
                    }
                });
                
                // remove group from selectBox
                $('#cInput').children().each(function(){
                    if($(this).val() == group)
                        $(this).remove();
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
                
                $('#byd-btn-livemode-start .status').html("on");
                $(".byd-btn-livemode").addClass("byd-btn-livemode-on");
                
                $('.dawInterfaceContent').addClass("full-width");
                
                $('body').addClass("stop-scrolling");
                $('body').bind('touchmove', function(e){e.preventDefault()});
                
                liveObj.active = true;
            };
            
            this.stop = function(){
                liveObj._show();
                
                $('#byd-btn-livemode-start .status').html("off");
                $(".byd-btn-livemode").removeClass("byd-btn-livemode-on");
                
                $('.dawInterfaceContent').removeClass("full-width");
                
                $('body').removeClass("stop-scrolling");
                $('body').unbind('touchmove');
                
                liveObj.active = false;
            };
            
            this._hide = function(){
//                $('#top, #byd-navbar-editor, .dawMenuBottom, .dawConfig, .byd-header, .col-md-1, .col-md-3').hide();
//                $('.byd-navbar-editor').hide("slow");
                $('.byd-navbar-live').show("slow");                
                
                $('.byd-livemode-hide').hide();
            };
            
            this._show = function(){
//                $('#top, #byd-navbar-editor, .dawMenuBottom, .dawConfig, .byd-header, .col-md-1, .col-md-3').show("slow");
//                $('.byd-navbar-editor').show("slow");
                $('.byd-navbar-live').hide("slow");
                
                $('.byd-livemode-hide').show();
            };
        };
        /**********LiveMode\END**********/
        
        this.scroll = new function(){
            var scrollObj = this;
            
            this.windowHeight = 0;
            this.bodyHeight = 0;
            this.scrollingDistance = 0;
            this.step = 0;
            
            this.go = function(){
                scrollObj.windowHeight = $(window).height();
                scrollObj.bodyHeight = $("body").height();
                
                scrollObj.step = scrollObj.windowHeight/2;
                
                return this;
            };

            this.up = function(){
                if(scrollObj.scrollingDistance - scrollObj.step > 0){
                    scrollObj.scrollingDistance -= scrollObj.step;                    
                }else{
                    scrollObj.scrollingDistance = 0;
                }                
                $(window).scrollTop(scrollObj.scrollingDistance);
            };

            this.down = function(){
                if(scrollObj.scrollingDistance + scrollObj.step < scrollObj.bodyHeight){
                    scrollObj.scrollingDistance += scrollObj.step;
                    
                }else{
                    scrollObj.scrollingDistance = scrollObj.bodyHeight;
                }
                $(window).scrollTop(scrollObj.scrollingDistance);
            };
        };
        
        
        this.clear = function(){
            // empty selectBox
            $('#cInput').children().each(function(i){
                i>0?$(this).remove():true;
            });
            
            // empty object
            daw.guiElement = {};
            daw.guiGroup = {};
            
            // empty screen
            return this.$.html("");
            
        };
        
        this.activeGroup = {};
        this._listen = function(){
            
//            $('#dawNavBarElements li').hover(function(e){
//                $(this).toggleClass("dawNavBarMenuHighlighter");
//            })
//            $('#dropdownSamples').click(function(){
//                $('.dropdown-file .dropdown-menu').css("display","block");
//                $('.dropdown-submenu > .dropdown-menu').css("display","block");                
//            });
            
            $('.byd-config-nodejs input').on('change keyup',function(){
                $('#bt_updateConfNodeJS').addClass('btn-primary');
            });
            $('.byd-config-osc .form-control').on('change keyup',function(){
                $('#bt_updateConfOSC').addClass('btn-primary');
            });
            
            $('#bt_updateConfOSC').click(function(){
                console.log('updating ports initialized. sending ' + $('#oscincoming').val() + ' ' + $('#oscoutgoing').val());
//                cObj.bydSocket.createServer("oscServer",{"incomingPort":2020, "outgoingPort":2022});
                cObj.updateOSC({"incomingPort":$('#oscincoming').val(), "outgoingPort":$('#oscoutgoing').val()});
            });
//            $('#bt_updateConfOSC').tooltip('show');

//            $('#byd-bt-osc-send').click(function(){
//               console.log("TEST: <send ifacexml>");
//               console.log(ifacexml);
//               cObj.bydSocket.sendGUI(ifacexml);
//            });

            // editmode-buttonListener
            $('#byd-btn-editmode-start').on('click touch', function(e){
                cObj.edit.toggleEditMode();
            });
            // editmode-buttonListener
            $('.byd-btn-livemode').on('click touch', function(e){
                cObj.live.toggle();
            });
            // ScrollListeners
            $('.byd-btn-scrollup').on('click touch', function(e){
                cObj.scroll.go().up();
            });
            $('.byd-btn-scrolldown').on('click touch', function(e){
                cObj.scroll.go().down();
            });
            
            
            var id;     
            var lastHoveredGroup = {};
            var resetGroupColor = function(option){
                if((id = $(option).val()) != "#" + cObj.interfaceID){
                    $(id).css({
                        "background-color":"inherit",
                    });
                    }else{
                        $(id).css({"background-color":cObj.cStyle.interface.backgroundColor});
                    }
            };
            // hightlighting current parent ifaceObjects
            $('#cInput').on("click.select touch.select", function(){             
                $(this).children().each(function(i){
                    $(this).on("click.option touch.option",function(){
                        if(cObj.activeGroup == "#" + cObj.interfaceID){
                                $(cObj.activeGroup).css({"background-color":cObj.cStyle.interface.backgroundColor});
                            }else{
                                $(cObj.activeGroup).css({"background-color":"inherit"});
                            }                       
                            
                        cObj.activeGroup = $(this).val();                        
                        // if i > 0, dont mark (cause its the interface)
                        (i == 0) || $(cObj.activeGroup).css({"background-color":cObj.cStyle.interface.highlightColor});                                                
                    })
                    .on('mouseenter.option', function(){
                        if(lastHoveredGroup == "#" + cObj.interfaceID){
                                $(lastHoveredGroup).css({"background-color":cObj.cStyle.interface.backgroundColor});
                            }else{
                                $(lastHoveredGroup).css({"background-color":"inherit"});
                            }                       
                        
                        lastHoveredGroup = $(this).val();
                        // if i > 0, dont mark (cause its the interface)
                        (i == 0) || $(lastHoveredGroup).css({"background-color":cObj.cStyle.interface.highlightColor});
                    });
                });
            });            
                
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
        this.cGroup = null;        
        
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
            // style for active input Group
            $(bydObj.activeGroup).css({"background-color":bydObj.cStyle.interface.highlightColor});
            
        };
        
        this._loadStyle = function(style){
            switch (style){
                case "simple":
                    bydObj.cStyle.interface.backgroundColor = "#D5D8DD";
                    bydObj.cStyle.interface.highlightColor = "#ADD8E6";
                    break;
                case "retro":
                    break;
                case "edit":
                    bydObj.cStyle.interface.backgroundColor = "#D66666";                    
                    bydObj.cStyle.interface.highlightColor = "#D69A9A";
                    break;                    
            }
            return {"padding":"30px 15px","background-color":bydObj.cStyle.interface.backgroundColor};            
        };

        this.gui = {};
        
        this.getTargetID = function(){
//            console.log($('#cInput :selected').val());
            return $('#cInput :selected').val();
        };
        
        this.getMembership = function(identifier){
            var p;
            !identifier && (p = "iface");
            identifier && (identifier.indexOf("iface") != -1) && (p = "iface");
            identifier && (identifier.indexOf("vgroup") != -1) && (p = "vgroup");
            identifier && (identifier.indexOf("hgroup") != -1) && (p = "hgroup");
            
            return p;
        };
        
        this.elementWrapper = function(css){
            return $('<div class="bydElement" style="margin:2px;' + css + ';"></div>');
        };
        
        this.cleaner = function(){
            return $('<div class="cleaner" style="float:none;clear:both;"></div>');
        };        
        
                

        this.addButton = function(innerTarget, options){            
            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            console.log("addButton");
            var btnHtml = '<input class=\'\' data-type=\'button\' data-parent=\'' + this.getMembership(target) + '\' />';
//            $(btnHtml).dawButton().appendTo(target);            
            $(btnHtml).dawButton(options).appendTo(this.elementWrapper(this.getMembership(target)!="vgroup"?"float:left;":"").appendTo(target));
            // append attributes
            daw.guiElement["button" + (sumButtons++)].parentGroup = target;
            
            this.$.append(this.cleaner());
//            sumButtons++;
            
            return this;
        };
        
        this.addKnob = function(innerTarget, options){
            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            console.log("addKnob");
            var knobHtml = '<input class=\'\' data-type=\'knob\' data-parent=\'' + this.getMembership(target) + '\' />';
//            $(knobHtml).dawKnob().appendTo(target);            
            $(knobHtml).dawKnob(options).appendTo(this.elementWrapper(this.getMembership(target)!="vgroup"?"float:left;":"").appendTo(target));            
            // append attributes
            daw.guiElement["knob" + (sumKnobs++)].parentGroup = target;
            
            this.$.append(this.cleaner());
//            sumKnobs++;
            
            return this;
        };
        
        this.addSlider = function(innerTarget, options){
            this.addVerticalSlider(innerTarget, options);
        };
        
        this.addHorizontalSlider = function(innerTarget, options){
            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            console.log("addHorizontalSlider");
            var sliderHtml = '<input class=\'\' data-type=\'slider\' data-parent=\'' + this.getMembership(target) + '\' />';
//            $(sliderHtml).dawSlider().appendTo(target);            
            $(sliderHtml).dawHorizontalSlider(options).appendTo(this.elementWrapper(this.getMembership(target)!="vgroup"?"float:left;":"").appendTo(target));
            // append attributes
            daw.guiElement["slider" + (sumSlider++)].parentGroup = target;
            
            this.$.append(this.cleaner());
//            sumSlider++;
            
            return this;
        };
        
        this.addVerticalSlider = function(innerTarget, options){
            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            console.log("addVerticalSlider");
            var sliderHtml = '<input class=\'\' data-type=\'slider\' data-parent=\'' + this.getMembership(target) + '\' />';
//            $(sliderHtml).dawSlider().appendTo(target);            
            $(sliderHtml).dawVerticalSlider(options).appendTo(this.elementWrapper(this.getMembership(target)!="vgroup"?"float:left;":"").appendTo(target));
            // append attributes
            daw.guiElement["slider" + (sumSlider++)].parentGroup = target;
            
            this.$.append(this.cleaner());
//            sumSlider++;
            
            return this;
        };        
        
        
        this.addXY = function(innerTarget, options){
            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            console.log("addXY");
            var xyHtml = '<input class=\'\' data-type=\'xy\' data-height=\'100\' data-width=\'150\' value=\'\' data-parent=\'' + this.getMembership(target) + '\'/>';
//            $(xyHtml).dawXY().appendTo(target);            
            $(xyHtml).dawXY(options).appendTo(this.elementWrapper(this.getMembership(target)!="vgroup"?"float:left;":"").appendTo(target));            
            // append attributes
            daw.guiElement["xy" + (sumXY++)].parentGroup = target;
            
            this.$.append(this.cleaner());
//            sumXY++;
            
            return this;
        };
        
        daw.guiGroup = {};
        this.addVGroup = function(innerTarget){
//            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            
            // init groupElement
            daw.guiGroup[this.cGroup = "vgroup" + sumVGroup++] = {};
            var properties = {
                    "css":{"default":{"position":"relative","min-width":"25px", "min-height":"25px","border":"none","background-color":"inherit","padding":"0", "cursor":"inherit"}},
                    "id":this.cGroup,
                    "type":"vgroup",
                    "parent":target,
                    "parentType":this.getMembership(target)
            };
            
            var vgHtml = '<div id=\'' + this.cGroup + '\'  data-parent=\'' + this.getMembership(target) + '\' class=\'vgroup\' style=\'' + ((this.getMembership(target)!="vgroup")?"float:left;":"") + '\'></div>';
//            $(vgHtml).appendTo(this.elementWrapper().appendTo(target));            
            $(vgHtml).css(properties.css.default).appendTo(target);   
//            this.$.append(this.cleaner());
            
//            this.cGroup = "vgroup" + sumVGroup++;
            $('#cInput').append("<option selected=\'selected\' value=\'" + "#" + this.cGroup + "\'>" + this.cGroup + "</option>");
            
            // store properties
            daw.guiGroup[this.cGroup] = properties;
            daw.guiGroup[this.cGroup].wrapperDiv = vgHtml;
            
            return this;
        };
        
        this.addHGroup = function(innerTarget){
//            this.$.find('.cleaner').remove();
            var target = innerTarget || this.getTargetID();
            
            // init groupElement
            daw.guiGroup[this.cGroup = "hgroup" + sumHGroup++] = {};
            var properties = {
                    "css":{"default":{"position":"relative","min-width":"25px", "min-height":"25px","border":"none","background-color":"inherit","padding":"0", "cursor":"inherit"}},
                    "id":this.cGroup,
                    "type":"hgroup",
                    "parent":target,
                    "parentType":this.getMembership(target)
            };
            
            var hgHtml = '<div id=\'' + this.cGroup + '\' data-parent=\'' + this.getMembership(target) + '\' class=\'hgroup\' style=\'' + ((this.getMembership(target)!="vgroup")?"float:left;":"") + '\'></div>';
//            $(hgHtml).appendTo(this.elementWrapper().appendTo(target));            
            $(hgHtml).css(properties.css.default).appendTo(target);   
//            this.$.append(this.cleaner());
            
//            this.cGroup = "vgroup" + sumVGroup++;
            $('#cInput').append("<option selected=\'selected\' value=\'" + "#" + this.cGroup + "\'>" + this.cGroup + "</option>");
            
            // store properties
            daw.guiGroup[this.cGroup] = properties;
            daw.guiGroup[this.cGroup].wrapperDiv = hgHtml;
            
            return this;
        };
        
    };
    
// Listener
    $.fn.BYD = function (options) {
        var byd = new BYD();
//        byd.targetID = this.selector;
        byd.options = options;
        byd.$ = $(this);
//        console.log($('#cInput').children().first().html());
        
        return byd.run();
    };

})(jQuery);