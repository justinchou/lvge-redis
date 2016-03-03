/**
 * FileName: easy-pool
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/30/2014.
 * At Time: 10:59 AM
 */

var pool_module = require('generic-pool');
var redis = require('redis');

var pool = {
    create: function (settings) {
        var opts = {};
        opts.no_ready_check = true;
        if (settings.auth_pass) {
            opts.auth_pass = settings.auth_pass;
        }
        if (settings.encoding) {
            opts.encoding = settings.encoding;
        }
        if (settings.debug_mode) {
            opts.debug_mode = settings.debug_mode;
        }
        if (settings.return_buffers) {
            opts.return_buffers = settings.return_buffers;
        }

        // Max Connection To Keep In Pool 最大连接数
        var maxConnections = 1000;
        if (settings.max && parseInt(settings.max, 10) > 1) {
            maxConnections = parseInt(settings.max, 10);
        }
        // Connection Auto-free Time In ms 连接空闲自动断开时间
        var idleTimeoutMillis = 30000;
        if (settings.idleTimeoutMillis && parseInt(settings.idleTimeoutMillis, 10) > 10000) {
            idleTimeoutMillis = parseInt(settings.idleTimeoutMillis, 10);
        }

        var _pool = pool_module.Pool({
            name: settings.name,
            dbIndex: 0,
            create: function (cb) {
                var client = redis.createClient(settings.port, settings.host, opts);
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
            max: maxConnections,
            idleTimeoutMillis: idleTimeoutMillis,
            log: !!settings.log
        });

        return _pool;
    }
};

var easy_pool = (function () {
    var pool_cache = {};

    function fetch(settings, cb) {
        var cache_key = JSON.stringify(settings);
        if (!pool_cache[cache_key] || !pool_cache[cache_key].client) {
            pool_cache[cache_key] = {
                "client": pool.create(settings),
                "proxy": false
            };
        }
        return pool_cache[cache_key].client;
    }

    return {
        fetch: fetch
    };
})();

module.exports = easy_pool;
