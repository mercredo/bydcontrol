var BydSocket = function(ip, port){
	
		// new useragent "bydandroid" set in androidApp
		var isAndroidApp = navigator.userAgent.toLowerCase().indexOf("bydandroid") > -1 || false;
//		console.log("isAndroidApp: " + isAndroidApp);
//		var device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));console.log(device);
        var cObj = this;
        this.socket = {};
        this.ip = ip || "127.0.0.1", this.port = port || "8081";
        this._ioScriptLoaded = false;
        
        this.init = function(onComplete, onFail){            
        	if(!isAndroidApp){       		// if normal or mobile browser
	            cObj._enableIOScript(function(){
	                //io complete::start initiating nodeConfig
	                cObj.createSocket(function(){
	                    // do stuff                    
	                    onComplete(); //{'bridge':{'ip':cObj.nodejsIP,'port':cObj.nodejsPort},'osc':{'incoming':'1337', 'outgoing':'1338'}}
	                });
	            }, function(){
	               onFail();
	            });
        	}
        	else{        		// if bydcontrolAndroidApp
        		cObj.createAndroidSocket(function(){
        			
        		});
        	}
        	
            return this;
        };     
        
        this.createAndroidSocket = function(onConnected){
        	console.log("connecting to androidSocket...");
        	
        	// When connected
        	onConnected();
        };
        
        
        this.createSocket = function(onConnected){
            console.log('connecting ioSocket...');
//            if(io){
//                this.socket = io.connect('http://' + this.ip, { port: this.port, rememberTransport: false}); //deprecated
                this.socket = io("http://" + this.ip + ":8081").on('connect', function(){
                   console.log("websocket connected"); 
                   onConnected();
                });
                
                return this;
        };
        
        this.updateServer = function(serverType, cfg, callback){
//            if(this.socket.socket){ //deprecated
            if(this.socket.connected){    
                    cObj.socket.emit(serverType || "default",
                        {
                            server: {
                                port: cfg.incomingPort || 3333, //incoming, default: 3333
                                host: cObj.ip
                            },
                            client: {
                                port: cfg.outgoingPort || 3334, //outgoing, default: 3334
                                host: cObj.ip
                            }
                        }
                    );
                    callback(cfg);
            }
            else
                throw new Error("No socket connected!");
            
            return this;
        };
        
        this.createServer = function(serverType, cfg){
//            if(this.socket.socket){ // deprecated
            if(this.socket.connected){
                console.log("Creating subServer <" + serverType + "|i:" + cfg.incomingPort + ",o:" + cfg.outgoingPort + "> on " + this.ip + ":" + this.port + "...");
                // socket.emit will only run once
//                this.socket.on('connect', function() { //temporarily removed after migration to socket.io-v1.0; prevents from being run twice
//                    console.log('socketonconnect');
                // sends to socket.io server the host/port of oscServer
                // and oscClient
                    this.socket.emit(serverType || "default",
                        {
                            server: {
                                port: cfg.incomingPort || 3333, //incoming, default: 3333
                                host: cObj.ip
                            },
                            client: {
                                port: cfg.outgoingPort || 3334, //outgoing, default: 3334
                                host: cObj.ip
                            }
                        }
                    );
//                });
            }
            else
                throw new Error("No socket created!");
            
            return this;
        };
        
        
        
        this._enableIOScript = function(onComplete, onFail){
            console.log("enabling script..." + cObj.ip + " " + cObj.port);
//            addScript("http://" + ip + ":" + port + "/socket.io/socket.io.js");
            jQuery.ajax({
                url: "http://" + cObj.ip + ":" + cObj.port + "/socket.io/socket.io.js",
                crossDomain: true,
                dataType: "script",
                success: function () {
                    console.log("ioScript loaded!");
                    cObj._ioScriptLoaded = true;
                    onComplete(io);
                    // script is loaded
                },
                error: function () {
                    console.log("ioScript failed!");                    
                    // handle errors
                },
                complete: function(){
                    console.log("complete");
                    console.log(cObj._ioScriptLoaded);
                    if(!cObj._ioScriptLoaded){
                        console.log("ioScript failed!");
                        console.log(data);
                        onFail();
                    }
                    cObj._ioScriptLoaded = false;
                    console.log(cObj._ioScriptLoaded);
                }        
            });        
        };        
        

        // TODO: maybe to be outsourced to new oscclass
        this.sendOSC = function(address, values, callback){
//            var osc = "", obj, val;
            var _send = function(){
                console.log("\tover socket");
                
                console.log("send /" + address + " " + values.toString());
                cObj.socket.emit('oscOut', "/" + address, values); //space as string-HACK for element.button.js; problematic?????; maybe use 0/1 
                
                callback();
            };
            
            console.log("sending osc-request");
            _send();
//            if(!ajax)_send(data);
//                else ajaxHandler.send(data);            
       };
       
       this.sendGUI = function(gui){
           // TODO: check if valid xml (-->loadxml.js.php)
           cObj.socket.emit('guiOut', gui);
       };

        this._listen = function(type, callback){
            // Listener for incoming nodeJS-Messages
            this.socket.on(type || 'message', function(obj) {
//                console.log("showing OBJ, while listening on msg[" + type + "]");
//                console.log(obj);
                
                callback(obj);
            });
        };
        
    };

