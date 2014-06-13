var OscHandler = function(){
    var oscObject = this;
    var socketHandler = {};
    var ajaxHandler = {};
    
    this.nodejsIP = "127.0.0.1", this.nodejsPort = "8081";
        
        this.init = function(onComplete, onFail){
            socketHandler = new SocketMgt(this.nodejsIP, this.nodejsPort);//, ajaxHandler = new AjaxMgt();
            
            socketHandler._enableIOScript(function(){
                //io complete::start initiating nodeConfig
                socketHandler.createSocket().submitBridgeConfig(
                        {"ip":"127.0.0.1","incomingPort":"1337","outgoingPort":"1338"}
            );
//                onComplete(oscObject.nodejsIP, oscObject.nodejsPort);
                onComplete({'bridge':{'ip':oscObject.nodejsIP,'port':oscObject.nodejsPort},'osc':{'incoming':'1337', 'outgoing':'1338'}});
            }, function(){
               onFail();
            });
            
            return this;
        };
        
        this.updateConfig = function(ip, port){
            this.nodejsIP = ip;
            this.nodejsPort = port;
            
            return this;
        };
        
       this.send = function(cID, val, ajax){       
//            console.log(uiType + " >> " + val + " >> ");
            data = {"oscData":
                     {
//                         uiType: uiType,
                         value: val,
                         cID: cID
                    }
                 };
            console.log("sending osc-request");
            if(!ajax)socketHandler.send(data);
                else ajaxHandler.send(data);            
       };
   };

//<<<<<<<<<<<<<<<<<<<####################################>>>>>>>>>>>>>>>>>>>>>>

var SocketMgt = function(ip, port){
        var mgtObj = this;
        this.socket = {};
        this._ioScriptLoaded = false;
        
        this.createSocket = function(){
//            this._ioScriptLoaded = (!this._ioScriptLoaded)?this._enableIOScript():false;
            console.log('connecting io...');
//            if(io){
                this.socket = io.connect('http://' + ip, { port: port, rememberTransport: false});
                return this;
//            }
//            else
//                throw new Error("Server " + "http://" + ip + "/" + port + " not reachable!")            
        };
        
        
        
        this._enableIOScript = function(onComplete, onFail){
//            addScript("http://" + ip + ":" + port + "/socket.io/socket.io.js");
            $.ajax({
                url: "http://" + ip + ":" + port + "/socket.io/socket.io.js",
                crossDomain: true,
                dataType: "script",
                success: function () {
                    console.log("ioScript loaded!");
                    mgtObj._ioScriptLoaded = true;
                    onComplete(io);
                    // script is loaded
                },
                error: function () {
                    console.log("ioScript failed!");                    
                    // handle errors
                },
                complete: function(){
                    console.log("complete");
                    console.log(mgtObj._ioScriptLoaded);
                    if(!mgtObj._ioScriptLoaded){
                        console.log("ioScript failed!");
                        console.log(data);
                        onFail();
                    }
                    mgtObj._ioScriptLoaded = false;
                    console.log(mgtObj._ioScriptLoaded);
                }        
        });
        
    
//          if(this._ioScriptLoaded)return false;
//          console.log(ip + " " + port);
//          $.getScript( "http://" + ip + ":" + port + "/socket.io/socket.io.js" )
//            .done(function( script, textStatus ) {
//                mgtObj._ioScriptLoaded = true;
//                console.log( textStatus );
//                console.log(script);
//                onComplete(io);
//                return true;
//            });
//            .fail(function( jqxhr, settings, exception ) {
//                console.log("fail!");
//                mgtObj._ioScriptLoaded = false;
//                onFail(exception);
////                $( "div.log" ).text( "Triggered ajaxError handler." );
//            });
//
//            if(!mgtObj._ioScriptLoaded){
//                onFail();
//            }
        };

        
        this.submitBridgeConfig = function(cfg){
            if(this.socket.socket){
                console.log("submitting bridgeConf to " + ip + ":" + port + "...");
                this.socket.on('connect', function() {
                    console.log(this.socket);
                // sends to socket.io server the host/port of oscServer
                // and oscClient
                    this.emit('config',
                        {
                            server: {
                                port: cfg.incomingPort, //incoming
                                host: cfg.ip
                            },
                            client: {
                                port: cfg.outgoingPort, //outgoing
                                host: cfg.ip
                            }
                        }
                    );
                });
            }
            else
                throw new Error("No socket created!");
        };
        
        this.send = function(data){
            console.log("\tover socket");
            console.log('\tmessage:: ' + "/" + data.oscData.cID + " " + data.oscData.value);
            this.socket.emit('message', "/" + data.oscData.cID + " " + data.oscData.value);
        };
        
//        this._listenConfig = function(){
//            this.socket.on('oscServerConf', function(data){
//                console.log("RECEIVING OSCCONF...");
//                console.log(data);
//            });
//        };
        
//        this._listen = function(){
//            this.socket.on('message', function(obj) {
//                console.log(obj);
//                $('#status').html(obj);
//
//                var elementID = obj[0].replace("/","");
//                if(elementID in daw.guiElement){
//                    console.log("elementType[" + elementID + "] available");
//                    daw.guiElement[elementID].change(obj[1]).updateGUI(); // TODO: if obj.size > 2
//                    
//                }
////                console.log($('.knob').eq(1).html());
//                
//            });
//        };
        
    }
    
   var AjaxMgt = function(){
       this.send = function(data){
       console.log("\tover ajax");
            $.ajax({
                 type: "POST",
                 url: "osc.service.php",
                 data: data,
                 success: function(data){
                     console.log(data);
                 },
                 dataType: "json"
            });
       }; 
   } 
    
   
   
   
   