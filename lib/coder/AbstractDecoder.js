//self
module.exports = class AbstractDecoder {
    /**
     * 当前handler被注册时调用
     */
    onRegistered() {
    }

    /**
     * 当连接成功时激活调用
     */
    onConnection(socket, ip, port) {}

    onDisconnection(socket, ip, port) {}

    /**
     * 接收到数据时调用
     * @param data
     */
    onData(socket, data) {}

    onExceptionCaught(socket, err, ip, port) {}

    onTimeout(socket, ip, port) {}

    getHead(buffer) {
        throw new Error('Please implement getHead method.');
    }
};