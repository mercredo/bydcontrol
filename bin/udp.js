    var dgram = require("dgram");
    
        //init guiClient
        var client = {}, message;
        var destination = {address: 'localhost',port:4778};
        
        message = new Buffer('this is a message');        
        client = dgram.createSocket("udp4");

        client.on("error", function (err) {
          console.log("client error:\n" + err.stack);
          client.close();
        });

        client.on("message", function (msg, rinfo) {
          console.log("client got: " + msg + " from " +
            rinfo.address + ":" + rinfo.port);
        });

        client.on("listening", function () {
          var address = client.address();
          console.log("guiClient listening " +
              address.address + ":" + address.port);
        });
        // client listening 0.0.0.0:port
        client.bind(4455, function(){
//            client.addMembership('230.185.192.108');
        });
        
        function test(buffer){
            setTimeout(function(){
                console.log("send [" + buffer + "] to " + destination.address + ":" + destination.port);
                client.send(buffer, 0, buffer.length, destination.port, destination.address, function(err, bytes){
//                    test(buffer);
                });                
            },1000);
        }
        
        function prepare(data){
            console.log("###############################################");
            console.log(data);
            console.log("###############################################");
            return new Buffer(data,"utf-8");
        }
        
//        var xml = loadData('/var/www/mobileMerc/projects/bydcontrol/SAMPLES/byd.xml', function(data){
//            test(prepare(data));            
//        });
        
        var json = loadData('/var/www/mobileMerc/projects/bydcontrol/SAMPLES/multislider1-1.json', function(json){
            test(prepare(json));            
        });
        
        
        
    function loadData(filename, callback){
        var fs = require('fs');
        fs.readFile(filename, 'ascii', function(err,data){
            if(err) {
                console.log("Could not open file"+ err);
                process.exit(1);
            }
            
            callback(data);
        });
    }  