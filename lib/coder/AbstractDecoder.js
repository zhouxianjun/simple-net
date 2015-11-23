//self
const _ = require('underscore');

const ring = require("ring");
module.exports = ring.create({
      logger: null,
      args: null,
      init: function(){
            this.args = arguments;
      },
      /**
       * 当前handler被注册时调用
       */
      onRegistered: function(){
      },
      /**
       * 当连接成功时激活调用
       */
      onConnection: function(socket, ip, port){
            if(this.logger)
                  this.logger.info('connection ip = %s port = %d', ip, port);
      },
      onDisconnection: function(socket, ip, port){
            if(this.logger)
                  this.logger.info('IP:%s PORT:%d 断开连接...', ip, port);
            socket.destroy();
      },
      /**
       * 接收到数据时调用
       * @param data
       */
      onData: function(socket, data){},
      onExceptionCaught: function(socket, err, ip, port){
            if(this.logger)
                  this.logger.error("IP:%s PORT:%d 连接异常，关闭连接! %s", ip, port, err);
            socket.destroy();
      },
      onTimeout: function(socket, ip, port){
            if(this.logger)
                  this.logger.warn("IP:%s PORT:%d, 超时，关闭连接", ip, port);
            socket.destroy();
      },
      getHead: function(buffer){
            buffer = null;
            throw new Error('Please implement getHead method.');
      }
});