// bridge construction
var osc = require('node-osc'),
//    sys = require('sys'),
    io = require('socket.io')(8081);
    
//    console.log(io);

var oscServer, oscClient;

io.on('connection', function (socket) {
    console.log("CONNECTION received");
    //get listen port through config json-var of webclient
    socket.on("oscServer", function (obj) {
        console.log("Creating OSC-Server and -Client on Port 8081:");
    //    console.log(obj);
        oscServer = new osc.Server(obj.server.port, obj.server.host);
        console.log("Bridge listening as Server:: Host: " + obj.server.host + ", Port: " + obj.server.port);
        oscClient = new osc.Client(obj.client.host, obj.client.port);
        console.log("Bridge listening as Client:: Host: " + obj.client.host + ", Port: " + obj.client.port);
//        // send configConfirmation to webClient
//        socket.emit('oscServerConf',{
//            'outgoing':{'ip':obj.client.host,'port':obj.client.port},
//            'incoming':{'ip':obj.server.host,'port':obj.server.port}});
        
//        socket.join("session1"); //define session for each bunch of clients

        // send status==connected to "real" application
        oscClient.send('/status', socket.sessionId + ' connected');
        
        // awaits data from "real" application, forwards to webclient
        oscServer.on('message', function(msg, rinfo) {
            console.log(msg + " from RT-Application", rinfo);
            socket.emit("bydOsc", msg); //.broadcast to send to all webclients
        });
        
        // send oscData to "real" application
        socket.on("oscOut", function (obj, val) {
            console.log("sendToApplication::" + obj + " " + val);
            oscClient.send(obj, parseFloat(val));
        });

  });
  
  socket.on("guiServer", function (obj) {
      var dgram = require("dgram");
        console.log("Creating GUI-Server and -Client on Port 8081:");
        
        var GUI = new function(){
            this.Client, this.Server;
            
            //init guiServer
            this.Server = function(){
                require('events').EventEmitter.call(this);

                this.socket = dgram.createSocket("udp4");
                // server listening 0.0.0.0:port
                this.socket.bind(obj.server.port);

                var server = this;

                this.socket.on("error", function (err) {
                  console.log("server error:\n" + err.stack);
                  server.close();
                });

                this.socket.on("message", function (msg, rinfo) {
                  console.log("server got: [" + msg + "] from " +
                    rinfo.address + ":" + rinfo.port);            

                    console.log("sending GUI to web application...");
                    console.log(msg + "  "); //empty string hack, because buffer bug is bugging me
                    console.log("''''''***********'''''''''***********'''''''''''''******'''''''");
                    socket.emit("bydGui", msg + "  "); //.broadcast to send to all webclients
                });

                this.socket.on("listening", function () {
                  var address = this.address();
                  console.log("guiServer listening " +
                      address.address + ":" + address.port);
                });
            };
            
            //init guiClient
            this.Client = function(){
                this.sendGui = function(msg){
                    switch (typeof msg) {
        //                case 'object':
        //                    var message = new Buffer(msg);
        //                    socket.send(message, 0, message.length, this.port, this.host);
        //                    break;
                        case 'string':
                            var message = new Buffer(msg);
                            this.socket.send(message, 0, message.length, this.port, this.host);
                            break;
                        default:
                            throw new Error("Error: not an object/ not a string/ not a well-formatted message.");
                    }
                };
            };
        };
        
        // init
        new GUI.Server();
        var client = new GUI.Client();
        
        
        
        
        // send guiData to "real" application
        socket.on("guiOut", function (obj) {
            console.log("sending GUI to real application...");
            client.sendGui(obj);
        });
  });
  
  
});
//io.listen(8081);

var ServiceDiscovery = new function(){
    this.ZeroConf;
    
    this.ZeroConf = function(){
        // Zeroconf Server
        var SSDP = require('node-ssdp')
          , server = new SSDP({logLevel: 'TRACE', log: true})
        ;

        server.addUSN('upnp:rootdevice');
        server.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
        server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
        server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');

        server.on('advertise-alive', function (heads) {
            console.log("advertise-alive");
          // Expire old devices from your cache.
          // Register advertising device somewhere (as designated in http headers heads)
        });

        server.on('advertise-bye', function (heads) {
            console.log('advertise-bye');
          // Remove specified device from cache.
        });

        // This should get your local ip to pass off to the server.; only works if part ogf network
        require('dns').lookup(require('os').hostname(), function (err, add) {
          server.server(add);
        });
    };
    
};

//new ServiceDiscovery.ZeroConf();
