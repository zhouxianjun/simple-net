'use strict';
const AbstractDecoder = require('./AbstractDecoder');
const domain = require('domain').create();
const ring = require("ring");
module.exports = class LengthDecoder extends AbstractDecoder {

};
const LengthDecoder = ring.create([abstract], {
    headSize: 2,
    maxLength: 0,
    mode: 'B', //L or B default B
    readOffset: 0,
    receiveBuffer: null, //当前数据已接收数据
    totalLength: 0, //当前数据总大小
    receiveLength: 0, //当前数据已接收长度
    packing: [], //每一次的包,
    logger: null,
    constructor: function(headSize, mode, logger){
        this.$super(headSize, mode, logger);
        this.headSize = headSize;
        if(mode === 'B' || mode === 'L')this.mode = mode
        else this.logger = mode;
        if(logger)this.logger = logger;
        this.maxLength = Math.pow(2, 8 * this.headSize) / 2 - 1;
    },
    onConnection: function(socket, ip, port){
        ring.getSuper(LengthDecoder, this, 'onConnection')(socket, ip, port);
        let self = this;
        domain.on('error', function(err){
            if(self.logger)
                self.logger.error('IP:%s onReceive error! %s', self.ip, err);
        });
    },
    onData: function(socket, data){
        try{
            if(data.length < 1){
                if(this.logger)
                    this.logger.warn('message length error......');
                socket.destroy();
                return;
            }
            this.packing.push(data);
            //上一次的读取完了
            if (this.totalLength <= 0) {
                //整个消息包大小
                this.totalLength = this.getHead(data);
                this.totalLength += this.headSize;//头的字节
                this.receiveBuffer = new Buffer(this.totalLength);
                if(this.logger)
                    this.logger.debug('读取新的包,大小:%d', this.totalLength);
            }
            //把当前接收的复制到数据里面
            let len = data.length > this.totalLength ? this.totalLength : data.length;
            data.copy(this.receiveBuffer, this.receiveLength, 0, len);
            this.totalLength -= len;
            this.receiveLength += len;
            if(this.receiveLength > this.maxLength){
                throw new RangeError('Adjusted frame length exceeds '+ this.maxLength +': '+ this.receiveLength +' - discarded');
            }
            if (this.totalLength <= 0 && this.receiveLength != null) {
                if(this.logger)
                    this.logger.debug("一个包读取完毕,回调接收函数,共 %d 次", this.packing.length);
                let tmp = new Buffer(this.receiveBuffer.length);
                this.receiveBuffer.copy(tmp);
                let self = this;
                domain.run(function(){
                    self.onReceive && setImmediate(self.onReceive.bind(self), tmp, tmp.length - self.headSize);
                });
                //清空上一次的数据
                this.receiveLength = 0;
                this.receiveBuffer = null;
                this.packing.length = 0;
            }
        }catch (err){
            if(this.logger)
                this.logger.error('IP:%s 接收消息异常:不符合标准! %s', socket.remoteAddress, err);
        }
    },
    onReceive: function(buffer, length){
        if(this.logger)
            this.logger.debug('接收到一个包:' + length, '剩余内存:%d', process.memoryUsage());
        buffer = null;
    },
    getHead: function(buffer){
        return buffer['readUInt' + 8 * this.headSize + this.mode + 'E'](this.readOffset);
    }
});
module.exports = LengthDecoder;