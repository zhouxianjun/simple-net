'use strict';
const ring = require("ring");
const _ = require('underscore');

const Handler = require('./coder/AbstractDecoder');

const net = require('net');

module.exports = ring.create({
    handlers: [],
    client: null,
    reconnectCount: 0,
    config: {
        idle: 10 * 1000,
        reconnect: false,
        heartbeat: false,
        reconnectCount: 100,
        reconnectInterval: 3000,
        host: 'localhost',
        port: 0,
        family: 4,
        logger: null
    },
    _heartbeatTimer: null,
    constructor: function(config) {
        this.config = _.extend(this.config, config);
    },
    sendHeartbeat: function(handler, client){},
    addHandler: function(handler){
        if(ring.instance(handler, Handler)){
            this.handlers.push(handler);
            handler.onRegistered();
        }
        return this;
    },
    reconnect: function(){
        if(this.config.reconnect && this.config.reconnectCount > 0 && this.reconnectCount < this.config.reconnectCount){
            let self = this;
            let t = self.config.reconnectInterval;
            if(self._heartbeatTimer != null){
                clearInterval(self._heartbeatTimer);
                self._heartbeatTimer = null;
                t += 1000;
            }
            setTimeout(function(){
                if(self.config.logger)
                    self.config.logger.info('开始重连服务器 IP=%s,PORT=%d', self.config.host, self.config.port);
                self._connect();
                self.reconnectCount++;
            }, t);
        }
    },
    _connect: function(callback){
        let self = this;
        let client = net.connect({
            port: self.config.port,
            host: self.config.host || 'localhost',
            family: self.config.family || 4
        }, function(){
            if(self.config.logger)
                self.config.logger.info("连接上服务器 IP=%s,Port=%d", self.config.host, self.config.port);
            self.handlers.every(function(handler, index, handlers){
                handler.socket = client;
                handler.ip = self.config.host;
                handler.port = self.config.port;
                handler.onConnection.call(handler, client, self.config.host, self.config.port);
                return true;
            }, client);
            self.reconnectCount = 0;
            self.client = client;
            _.isFunction(callback) && callback.call(self, arguments);
            if(self.config.heartbeat && _.isFunction(self.sendHeartbeat)){
                setTimeout(function(){
                    self._heartbeatTimer = setInterval(self.sendHeartbeat.bind(self), self.config.idle, self.client);
                }, 1000);
            }
        });
        client.on('data', function(data){
            self.handlers.every(function(handler, index, handlers) {
                handler.onData.call(handler, client, data);
                return true;
            }, client);
        });
        client.on('error', function(err){
            self.handlers.every(function(handler, index, handlers) {
                handler.onExceptionCaught.call(handler, client, err, self.config.host, self.config.port);
                return true;
            }, client);
            _.isFunction(self.reconnect) && self.reconnect.call(self);
        });
        client.on('end', function(){
            self.handlers.every(function(handler, index, handlers) {
                handler.onDisconnection.call(handler, client, self.config.host, self.config.port);
                return true;
            }, client);
            _.isFunction(self.reconnect) && self.reconnect.call(self);
        });
    },
    connect: function(callback){
        this._connect(callback);
        return this;
    }
});