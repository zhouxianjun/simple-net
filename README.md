

# 如何安装

[Node.js](http://nodejs.org).

[![NPM](https://nodei.co/npm/simple-net.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/simple-net/)

npm install simple-net

# 注意

<font color=red> 该项目采用 [ES6](es6.ruanyifeng.com) 编写</font>

---

# 如何使用

## TCP Server
```javascript
//自己的日志处理器 我这边推荐使用 [tracer](http://github.com/baryon/tracer)
var logger = require('tracer').dailyfile({
    root:'../logs'
}, {
    format : [
        "{{timestamp}} <{{title}}>  [{{file}}:{{line}}:{{pos}}] - {{message}}", //default format
        {
            error : "{{timestamp}} <{{title}}>  [{{file}}:{{line}}:{{pos}}] - {{message}}\nCall Stack:\n{{stack}}" // error format
        }
    ],
    dateformat : "HH:MM:ss.L",
    preprocess :  function(data){
        data.title = data.title.toUpperCase();
    }
});
//引用模块
var socket = require('simple-net');
//获取TCP服务类
var Server = socket.TCPServer;
//实例化TCP服务 这里使用的是链式操作
//addHandler: 新增一个数据接收解码处理器
new Server({
    logger: logger
}).addHandler(new socket.coder.LengthDecoder(2, logger)).start(1234);
```
## Server option
    port: port || 0, //绑定端口
    server: , //启动成功暴露
    backlog: 511,
    logger: null,
    idle: 60 * 1000 //超时时间

## 解码处理器
AbstractDecoder: 解码器父类
LengthDecoder: 长度解码器

## AbstractDecoder 属性
    logger: null, //日志处理器
    
## AbstractDecoder 函数
    //当前handler被注册时调用
    onRegistered: 
    //当连接成功时激活调用
    onConnection: socket, ip, port
    //断开连接回调
    onDisconnection: socket, ip, port
    //接收数据
    onData: socket, data
    //异常
    onExceptionCaught: socket, err, ip, port
    //超时
    onTimeout: socket, ip, port
    //必须重写
    getHead: buffer

## LengthDecoder 属性
    headSize: 2, //协议头大小 默认2个字节
    maxLength: 0, //构造函数会自动计算
    mode: 'B', //L or B default B //大端与小端 默认大端
    readOffset: 0, //当前读取偏移量
    receiveBuffer: null, //当前数据已接收数据
    totalLength: 0, //当前数据总大小
    receiveLength: 0, //当前数据已接收长度
    packing: [], //每一次的包,
    logger: null, //日志处理器

## LengthDecoder 函数
    //构造函数
    constructor: headSize, mode, logger
    //连接初始化
    onConnection: socket, ip, port
    //数据接收解码处理
    onData: socket, data
    //数据解码完毕后回掉函数
    onReceive: buffer, length
    //解码获取头大小的值
    getHead

## TCP Client
```javascript
var socket = require('../index');
var Client = socket.TCPClient;
var MyClient = Client.$extend({
    sendHeartbeat: function(client){
        console.log('发送心跳...');
        //client.write(buffer);
    }
});
new MyClient({
    port: 1234, //端口
    reconnect: true, //是否重连
    heartbeat: true, //是否开启心跳
    logger: logger
}).addHandler(new socket.coder.LengthDecoder(2, 'B')).connect();
```
## Client option
    idle: 10 * 1000, //发送心跳间隔
    reconnect: false, //是否重连
    heartbeat: false, //是否发送心跳
    reconnectCount: 100, //重连最大次数
    reconnectInterval: 3000, //重连间隔
    host: 'localhost', //服务器地址
    port: 0, //服务器端口
    family: 4,
    logger: null