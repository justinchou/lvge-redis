/**
 * FileName: redisConf.json
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/30/2014.
 * At Time: 4:25 PM
 */

var redisConfig = {
    "name": "cache",

    "host": "redis",
    "port": 6379,
    //"auth_pass": "JCfdY15d6fH990SH7c2vDAgdfeY45CwA",
    "max": 10,
    "idleTimeoutMillis": 30000,
    "log": false,    // redis-pool debug

    //"debug_mode": false,    // zz-redis debug
    //"encoding": "binary",    // zz-redis encoding
    //"return_buffers": true
};

module.exports = redisConfig;
