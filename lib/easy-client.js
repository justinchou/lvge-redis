/**
 * FileName: easy-client
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/30/2014.
 * At Time: 10:59 AM
 */

var redis = require('redis');
var easy_pool = require('./easy-pool');

/**
 * @class
 * @property {object} client - A Redis Client object.
 * @property {object} pool - The connection pool to use (if set).
 */
function EasyClient(client, pool) {
    this.client = client;
    this.pool = pool;
}

/**
 * This just delegates to the client query.
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 * @returns {object} - The result returned by node-redis.
 */
EasyClient.prototype.query = function (handler, params, cb) {
    params.push(cb);
    this.client[handler].apply(this.client, params);
};

EasyClient.prototype.multi = function (args) {
    return this.client.multi(args);
};

/**
 * If we're using a pool, release the client.
 * If we're using a client directly, call its end() function
 */
EasyClient.prototype.end = function () {
    if (this.pool) {
        this.pool.release(this.client);
    } else {
        this.client.end();
    }
};

/**
 * @private
 */
function get_client_from_pool(pool, cb) {
    pool.acquire(function (err, client) {
        if (err) {
            cb(err, null);
        } else if (!client) {
            // What should we do here?  Maybe throw the error?
            cb(new Error("Client not acquired"), null);
        } else {
            cb(null, new EasyClient(client, pool));
        }
    });
}

/**
 * Create an instance of EasyClient.
 * @param {object} settings - same settings as EasyRedis.connect
 * @param {function} cb - callback function
 * @see EasyRedis.connect
 */
EasyClient.fetch = function (settings, cb) {
    if (settings.pool) {
        get_client_from_pool(settings.pool, cb);
    } else if (settings.use_easy_pool) {
        var pool = easy_pool.fetch(settings);
        get_client_from_pool(pool, cb);
    } else {
        var client;
        client = redis.createClient(settings);
        cb(null, new EasyClient(client));
    }
};

exports.fetch = EasyClient.fetch;