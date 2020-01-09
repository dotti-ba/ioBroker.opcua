var opcua = require('node-opcua');
var utils = require('@iobroker/adapter-core'); // Get common adapter utils
var tools = require(utils.controllerDir + '/lib/tools');
var pack  = require(__dirname + '/../package.json');

function OPCUAServer(adapter, states, objects) {
    'use strict';

    if (!(this instanceof OPCUAServer)) return new OPCUAServer(adapter, states, objects);

    var server   = null;
    var clients  = {};

    this.destroy = function () {
        if (server) {
            // to release all resources
            server.shutdown(function () {
                console.log('all gone!');
            });
            server = null;
        }
    };
    
    this.onStateChange = function (id, state) {
        adapter.log.debug('onStateChange ' + id + ': ' + JSON.stringify(state));
        if (server) {
            convertValue(id);
        }
    };

    function updateClients() {
        var text = '';
        if (clients) {
            for (var id in clients) {
                text += (text ? ',' : '') + id;
            }
        }

        adapter.setState('info.connection', {val: text, ack: true});
    }
    
    function getOpcType(type) {
        if (type === 'number') {
            return 'Double';
        } else if (type === 'string') {
            return 'String';
        } else if (type === 'boolean') {
            return 'Boolean';
        } else {
            return 'Double';
        }
    }

    function convertValue(id, val) {
        if (val === undefined) val = states[id].val;
        if (states[id].type === 'Double') {
            states[id].val = parseFloat(val);
        } else if (states[id].type === 'Boolean') {
            states[id].val = val === 'true' || val === true || val === '1' || val === 1;
        } else if (val === undefined || val === null) {
            states[id].val = '';
        } else {
            states[id].val = val.toString();
        }
    }

/*    function postInitialize() {
		adapter.log.info('START postInitialize');								// (klaus-ba)

//        var addressSpace = server.engine.addressSpace;
//		var namespace = addressSpace.getOwnNamespace();
        var devices = {};

		adapter.log.info('Test');								// (klaus-ba)

        var count = 0;
/*        for (var id in objects) {
            if (!objects.hasOwnProperty(id)) continue;

            var parts = id.split('.');
            var device = devices[parts[0] + '.' + parts[1]];
            if (!device) {
                devices[parts[0] + '.' + parts[1]] = addressSpace.addObject({
                    organizedBy: addressSpace.rootFolder.objects,
                    browseName:  parts[0] + '.' + parts[1]
                });

                device = devices[parts[0] + '.' + parts[1]];
            }
            parts.splice(0, 2);
            if (!states[id]) {
                states[id] = {val: null};
            }
            states[id].type = getOpcType(objects[id].common.type);

            if (!parts.length) {
                adapter.log.warn('Invalid name: ' + id);
                continue;
            }

            var options = {
                componentOf:    device,
                nodeId:         's=' + id, // a string nodeID
                browseName:     parts.join('.'),
                dataType:       states[id].type,
                value:          {}
            };

            if (objects[id].common.read || objects[id].common.read === undefined) {
                options.value.timestamped_get = function () {
                    var _id = this.nodeId.value;
                    if (!states[_id].ack) {
                        states[_id].ack = true;
                        adapter.setForeignState(_id, states[_id].val, true);
                    }
                    return new opcua.DataValue({
                        sourceTimestamp: states[_id].ts,
                        value: {
                            dataType: opcua.DataType[states[_id].type],
                            value: states[_id].val
                        }
                    });
                };
            }
            if (objects[id].common.write) {
                options.value.timestamped_set = function (data, cb) {
                    var _id = this.nodeId.value;
                    convertValue(_id, data.value.value);
                    adapter.setForeignState(_id, {val: states[_id].val, q: data.statusCode.value, ts: data.sourceTimestamp.getTime()});
                    if (cb) cb(null, opcua.StatusCodes.Good);
                };
                options.value.timestamped_get = options.value.timestamped_get || function () {
                    var _id = this.nodeId.value;
                    if (!states[_id].ack) {
                        states[_id].ack = true;
                        adapter.setForeignState(_id, states[_id].val, true);
                    }
                    return new opcua.DataValue({
                        sourceTimestamp: states[_id].ts,
                        value: {
                            dataType: opcua.DataType[states[_id].type],
                            value: states[_id].val
                        }
                    });
                };
            }

            convertValue(id);

            count++;
            addressSpace.addVariable(options);
            options = null;
            device  = null;
            parts   = null;
        } 
        // free memory
        objects = null;
        devices = null;

//        server.start(function () {
//            adapter.log.info('Starting OPCUA server on port ' + adapter.config.port + '. URL: ' + server.endpoints[0].endpointDescriptions()[0].endpointUrl + ', points - ' + count);
//        });
    }*/




// !!!!!!!!!!!!!!!!!!

function postInitialize() {
    console.log("initialized");
    function construct_my_address_space(server) {
    
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();
    
        // declare a new object
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "MyDevice"
        });
    
        // add some variables
        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let variable1 = 1;
        
        // emulate variable1 changing every 500 ms
        setInterval(function(){  variable1+=1; }, 500);
        
        namespace.addVariable({
            componentOf: device,
            browseName: "MyVariable1",
            dataType: "Double",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: variable1 });
                }
            }
        });
        
        // add a variable named MyVariable2 to the newly created folder "MyDevice"
        let variable2 = 10.0;
        
        namespace.addVariable({
        
            componentOf: device,
        
            nodeId: "ns=1;b=1020FFAA", // some opaque NodeId in namespace 4
        
            browseName: "MyVariable2",
        
            dataType: "Double",    
        
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: variable2 });
                },
                set: function (variant) {
                    variable2 = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });
        const os = require("os");
        /**
         * returns the percentage of free memory on the running machine
         * @return {double}
         */
        function available_memory() {
            // var value = process.memoryUsage().heapUsed / 1000000;
            const percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
            return percentageMemUsed;
        }
        namespace.addVariable({
        
            componentOf: device,
        
            nodeId: "s=free_memory", // a string nodeID
            browseName: "FreeMemory",
            dataType: "Double",    
            value: {
                get: function () {return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory() });}
            }
        });
    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}



// !!!!!!!!!!!!!!!!!!!!!






    var _constructor = (function (config) {
        config.port = parseInt(config.port, 10) || 1883;

        server = new opcua.OPCUAServer({
            port:               config.port, 								// the port of the listening socket of the server
            resourcePath:       '/UA/' + (config.name || tools.appName),	// this path will be added to the endpoint resource name (klaus-ba add / at beginn)
            certificateFile:    __dirname + '/../certificate.pem',
            privateKeyFile:     __dirname + '/../privatekey.pem',
            buildInfo : {
                productName: tools.appName,
                buildNumber: pack.version,
                buildDate:   new Date(2020,1,1)								//klaus-ba TODO Date aus Build
            }
        });

		adapter.log.info('config.port: ' + config.port);								// (klaus-ba)
		adapter.log.info('config.name: ' + config.name);								// (klaus-ba)
		adapter.log.info('tools.appName: ' + tools.appName);							// (klaus-ba)
		adapter.log.info('resourcePath: ' + '/UA/' + (config.name || tools.appName));								// (klaus-ba)
		adapter.log.info('OPCUA server Cert: ' + __dirname + '/../certificate.pem');	// klaus-ba)
        
        // create connected object and state
        adapter.getObject('info.connection', function (err, obj) {
            if (!obj || !obj.common || obj.common.type !== 'string') {
                obj = {
                    _id:  'info.connection',
                    type: 'state',
                    common: {
                        role:  'info.clients',
                        name:  'List of connected clients',
                        type:  'string',
                        read:  true,
                        write: false,
                        def:   false
                    },
                    native: {}
                };

                adapter.setObject('info.connection', obj, function () {
                    updateClients();
                });
            }
        });

        // to start
        server.initialize(postInitialize);
    })(adapter.config);
    
    return this;
}

module.exports = OPCUAServer;
