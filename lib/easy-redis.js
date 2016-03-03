/**
 * FileName: easy-redis
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/29/2014.
 * At Time: 5:28 PM
 */

var util = require('util');
var EasyClient = require('./easy-client');

function EasyRedis(settings) {
    if (!(this instanceof EasyRedis)) {
        return new EasyRedis(settings);
    }
    var self = this;
    self.client = null;
    self.settings = settings;
    self.logging = settings.logging;

    /**
     * @private
     */
    this.fetch_client = function (cb) {
        EasyClient.fetch(self.settings, function (err, client) {
            if (err) {
                cb(err);
            } else {
                self.client = client;
                cb(null, client);
            }
        });
    };

    /**
     * @private
     */
    this.log_error = function (err, sql, query_params) {
        if (self.logging && self.logging.events && self.logging.events.error && self.logging.events.error.level) {
            var level = self.logging.events.error.level;

            var msg = 'EasyRedis Error: ' + util.inspect(err) +
                ' - SQL: ' + sql + ' - Params: ' + util.inspect(query_params);
            if (err.stack) {
                msg += " - Stack: " + err.stack;
            }
            self.logging.logger[level](msg);
        }
    };
}

/**
 * Execute arbitrary SQL query.
 *
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 * @returns {object} - The result returned by node-mysql.
 *
 * @example
 *    var sql = "insert into users(login) values(?)";
 *    mysql_easy.execute(sql, ['bob'], function(err, result) { });
 */
EasyRedis.prototype.execute = function () {
    var self = this;

    var params_list = arguments;
    var arg_len = arguments.length;
    if (arg_len < 2) {
        console.log("error");
        return;
    }

    var handler = arguments[0];
    var cb = arguments[arg_len - 1];

    self.fetch_client(function (err, easy_client) {

        function end_handler(err, results) {
            if (err) {
                self.log_error(err, handler, params_list);

                if (easy_client) {
                    easy_client.end();
                }

                return cb(err, null);
            } else {
                cb(null, results);
                easy_client.end();
            }
        }

        if (err) {
            cb(err);
            if (easy_client) {
                easy_client.end();
            }
            return;
        } else {
            var params = [];
            for (var i = 1; i < arg_len - 1; i++) {
                params.push(params_list[i]);
            }
            easy_client.query(handler, params, end_handler);
        }
    });
};

/**
 * Redis Transaction
 * @param args
 * @param cb (err, multi)
 */
EasyRedis.prototype.multi = function (args, cb) {
    if (typeof args == "function") {
        cb = args;
        args = null;
    }

    var self = this;
    var multi = null;

    self.fetch_client(function (err, easy_client) {
        if (err) {
            cb(err);
            if (easy_client) {
                easy_client.end();
            }
        } else {
            multi = easy_client.multi(args);
            cb(err, multi);
        }
    });
};

/**
 * Directly establish a single connection for each query.
 * This is probably not a good idea for production code, but may be fine for code
 * where you don't want to set up a pool, such as in unit tests.
 *
 * @param {object} settings - An object of MySQL settings. Settings properties:
 * <br><pre>
 *   user          : (required) - Database user.
 *   database      : (required) - Database to connect to.
 *   password      : (optional) - default: null
 *   host          : (optional) - default: localhost
 *   port          : (optional) - default: 3306
 * </pre>
 *
 * @returns {EasyRedis} - returns an EasyRedis object.
 *
 * @example
 * var settings = {
 *     user     : 'myuser',
 *     password : 'mypass',
 *     database : 'mydb'
 * };
 *
 * var easy_mysql = EasyRedis.connect(settings);
 * easy_mysql.get_one("select * from foo where bar = ?", ['jazz'], function (err, result) {
 *     // do stuff
 * });
 */
EasyRedis.connect = function (settings) {
    return new EasyRedis(settings);
};

/**
 * Use built-in easy_pool.js, which uses generic-pool.
 *
 * @see <a href='https://github.com/coopernurse/node-pool'>node-pool</a>.
 * @see easy_pool
 *
 * @param {object} settings - An object of MySQL settings. Settings properties:
 * <br><pre>
 *   user          : (required) - Database user.
 *   database      : (required) - Database to connect to.
 *   password      : (optional) - default: null
 *   host          : (optional) - default: localhost
 *   port          : (optional) - default: 3306
 *   pool_size     : (optional) - The size of the pool in easy_pool.js. Default: 10
 * </pre>
 *
 * @returns {EasyRedis} - returns an EasyRedis object.
 *
 * @example
 * var settings = {
 *     user      : 'myuser',
 *     password  : 'mypass',
 *     database  : 'mydb',
 *     pool_size : 50
 * };
 *
 * var easy_mysql = EasyRedis.connect_with_easy_pool(settings);
 */
EasyRedis.connect_with_easy_pool = function (settings) {
    settings.use_easy_pool = true;
    return new EasyRedis(settings);
};

/**
 * Use a custom pool:
 *
 * @see easy_pool
 *
 * @param {object} pool - A connection pool. It must have functions named 'acquire' and 'release'.
 * See example in easy_pool.js.
 *
 * @returns {EasyRedis} - returns an EasyRedis object.
 *
 * @example
 * var my_pool = //.. create your own pool however you want.
 *
 * var easy_mysql = EasyRedis.connect_with_pool(pool);
 */
EasyRedis.connect_with_pool = function (pool, settings) {
    var args = {};
    if (settings) {
        args = settings;
    }
    args.pool = pool;
    return new EasyRedis(args);
};

exports.connect = EasyRedis.connect;
exports.connect_with_easy_pool = EasyRedis.connect_with_easy_pool;
exports.connect_with_pool = EasyRedis.connect_with_pool;

exports.classic = require("./easy-redis-classic");