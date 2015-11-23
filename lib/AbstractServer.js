'use strict';
const _ = require('underscore');
const Handler = require('./coder/AbstractDecoder');

const ring = require("ring");

const net = require('net');
const domain = require('domain').create();

module.exports = ring.create({
    handlers: [],
    server: null,
    config: {
        idle: 60 * 1000,
        logger: null
    },
    constructor: function(config) {
        this.config = _.extend(this.config, config);
    },
    addHandler: function(handler){
        if(ring.instance(handler, Handler)){
            this.handlers.push(handler);
            handler.onRegistered();
        }
        return this;
    },
    start: function(port, callback){
        let self = this;
        let server = net.createServer(function(client){
            client.setTimeout(self.config.idle);
            client.handlers = [];
            self.handlers.forEach(function(handler){
                let tmp = new handler.constructor();
                handler.constructor.apply(tmp, handler.args);
                client.handlers.push(tmp);
            });
            //client.setEncoding(self.config.encoding);
            domain.run(function(){
                client.handlers.every(function(handler, index, handlers){
                    handler.socket = client;
                    handler.ip = client.remoteAddress;
                    handler.port = client.remotePort;
                    handler.onConnection.call(handler, client, client.remoteAddress, client.remotePort);
                    client.on('data', function (data) {
                        handler.onData.call(handler, client, data, client.remoteAddress, client.remotePort);
                    });
                    client.on('timeout', function () {
                        handler.onTimeout.call(handler, client, client.remoteAddress, client.remotePort);
                    });
                    client.on('error', function (err) {
                        handler.onExceptionCaught.call(handler, client, err, client.remoteAddress, client.remotePort);
                    });
                    client.on('close', function () {
                        handler.onDisconnection.call(handler, client, client.remoteAddress, client.remotePort);
                    });
                    return true;
                }, client);
            });
            domain.on('error', function(err){
                if(self.config.logger)
                    self.config.logger.error('调用Handler处理异常!', err);
            });
        });
        self.server = server;
        _.extend(self.config, {
            port: port || 0,
            server: server,
            backlog: 511
        });
        server.listen(port, null, self.config.backlog, function(){
            self.config.ip = server.address().address;
            self.config.port = server.address().port;
            if(self.config.logger)
                self.config.logger.info('server starting is port %s', self.config.port);
            _.isFunction(callback) && callback.call(self, arguments);
        });
        return this;
    }
});