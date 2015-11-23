/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/23
 * Time: 18:00
 * To change this template use File | Settings | File Templates.
 *                 _ooOoo_
 *                o8888888o
 *                88" . "88
 *                (| -_- |)
 *                O\  =  /O
 *             ____/`---'\____
 *           .'  \\|     |//  `.
 *           /  \\|||  :  |||//  \
 *           /  _||||| -:- |||||-  \
 *           |   | \\\  -  /// |   |
 *           | \_|  ''\---/''  |   |
 *           \  .-\__  `-`  ___/-. /
 *         ___`. .'  /--.--\  `. . __
 *      ."" '<  `.___\_<|>_/___.'  >'"".
 *     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *     \  \ `-.   \_ __\ /__ _/   .-` /  /
 *======`-.____`-.___\_____/___.-`____.-'======
 *                   `=---='
 *^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *           佛祖保佑       永无BUG
 */
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