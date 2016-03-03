/**
 * FileName: redis
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/30/2014.
 * At Time: 4:37 PM
 */

var fs = require('fs');
var redis = require('redis');
var gpool = require('generic-pool');

var Utils = require("lvge-utils");

/** 配置模版
 *
 * {
 *    "name": "cache",
 *    "host" : "192.168.1.71",
 *    "port" : 20999,
 *    "max" : 100,
 *    "idleTimeoutMillis" : 30000,
 *    "log" : false
 * }
 *
 */

//存放当前已经初始化的Redis连接池对象映射 { name : poolob }
var pools = {};

/**
 * 创建Redis连接
 * @param {String | Object} config 配置参数
 */
function createRedis(config) {

    if (!config) {
        console.debug('createRedis config is NULL');
        return;
    }
    // 如果为文件路径. 加载文件
    if (typeof config === 'string') {
        config = Utils.UString.readConfig(config);  // JSON.parse(fs.readFileSync(config, "utf8"));
    }
    var opts = {};
    if (config.proxy) {
        opts.no_ready_check = config.proxy;
        if (config.auth_pass) {
            opts.auth_pass = config.auth_pass;
        }
        if (config.debug_mode) {
            opts.debug_mode = config.debug_mode;
        }
        if (config.encoding) {
            opts.encoding = config.encoding;
        }
        if (config.return_buffers) {
            opts.return_buffers = config.return_buffers;
        }

        var client = redis.createClient(config.port, config.host, opts);
        client.on('error', function (err) {
            console.error('连接Redis出现错误: %s', err.stack);
        });
        pools[config.name] = {};
        pools[config.name].client = client;
        pools[config.name].proxy = true;
    } else {
        opts.no_ready_check = true;
        if (config.auth_pass) {
            opts.auth_pass = config.auth_pass;
        }
        if (config.debug_mode) {
            opts.debug_mode = config.debug_mode;
        }
        if (config.encoding) {
            opts.encoding = config.encoding;
        }

        var _pool = gpool.Pool({
            name: config.name,
            dbIndex: 0,
            create: function (cb) {
                var client = redis.createClient(config.port, config.host, opts);
                client.on('error', function (err) {
                    console.error('连接Redis出现错误: %s', err.stack);
                });
                cb(null, client);
            },
            destroy: function (client) {
                if (client) {
                    client.quit();
                }
            },
            max: 1000,
            idleTimeoutMillis: 30000,
            log: false
        });
        pools[config.name] = {};
        pools[config.name].client = _pool;
        pools[config.name].proxy = false;
    }

    if (config.auth_pass) {
        pools[config.name].auth_pass = config.auth_pass;
    }
};

/**
 * 获取redis对象
 * @param {String} name 数据库名字
 * @param {Function} execb 回调函数, 获取对象后执行回调
 */
function execute(name, execb) {
    var pool = pools[name];
    if (!pool) {
        execb(null);
        console.error('获取redis连接[ %s ]未找到连接池对象!', name);
        return;
    }
    if (pool.proxy) {
        execb(pool.client, function () {
        });
    } else {
        // 连接池中获取对象
        pool.client.acquire(function (err, client) {
            var release = function () {
                pool.client.release(client);
            };
            if (err) {
                console.error('执行Redis命令时报错: %s', err.stack);
                release();
            } else {
                if (pool.auth_pass) {
                    client.auth(pool.auth_pass, function () {
                        execb(client, release);
                    });
                } else {
                    execb(client, release);
                }
            }
        }, 0);
    }
};

module.exports = {
    'createRedis': createRedis,
    'execute': execute
};
