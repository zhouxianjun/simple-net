/**
 * Created with JetBrains Idea.
 * User: Gary
 * Date: 2015/11/23
 * Time: 16:52
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
 *           ·ð×æ±£ÓÓ       ÓÀÎÞBUG
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
var Server = socket.TCPServer;
new Server({
    logger: logger
}).addHandler(new socket.coder.LengthDecoder(2, logger)).start(1234);