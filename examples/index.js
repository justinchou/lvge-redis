var redis = require("../index");
var config = require("./cfg/redisConf");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var fs = require("fs");
var pool = redis.connect_with_easy_pool(config);

function cb() {
    console.log(arguments);
}

function buf_cb(){
    var obj = {}
    for (var i=0; i<arguments.length; i++){
        if (!arguments[i]) {
            obj[i] = arguments[i];
        } else {
            obj[i] = new Buffer(arguments[i], config.enoding || "binary").toString("utf-8");
        }
    }
    console.log(obj);
}

// String
function test_string() {
    // EX - Expire Seconds, PX - Expire MillionSeconds, NX - Set When Not Exist Key, XX - Set Only When Exist Key
    // pool.execute("set", "key", "value" [,"EX|PX",10] [,"NX|XX"], cb);
    pool.execute("set", "justin", "mimi0", "EX", 10, "NX", cb);
    pool.execute("set", "justin", "mimi1", "PX", 10000, cb);
    pool.execute("set", "justin", "mimi2", "NX", cb);
    pool.execute("set", "justin", "mimi3", "XX", cb);
    pool.execute("get", "justin", cb);

    pool.execute("set", "justin", false, cb);   // 将存储成"false"字符串, true将存储成"true"字符串
    pool.execute("get", "justin", cb);
    pool.execute("del", "justin", cb);
}

// List
function test_list() {
    pool.execute("lpush", "l_justin", "11", "22", 33, 44, cb);
    pool.execute("lrange", "l_justin", 0, -1, cb);
    pool.execute("del", "l_justin", cb);

    var handler = ["lpush"], key = ["l_justin"], values = [1, 2, 3, 4, 5, 6];
    values = handler.concat(key, values, cb);
    console.log(values);
    pool.execute.apply(pool, values);
    pool.execute("lrange", "l_justin", 0, -1, cb);
    pool.execute("del", "l_justin", cb);
}

// Hash
function test_hash() {
    pool.execute("hmset", "h_justin", {"name": "mimi", "age": 20}, cb);
    pool.execute("hmset", "h_justin", "hair", "black", "glass", 1, cb);
    pool.execute("hset", "h_justin", "sex", "man", cb);
    pool.execute("hgetall", "h_justin", cb);
    pool.execute("hdel", "h_justin", "age", cb);
    pool.execute("hgetall", "h_justin", cb);
    pool.execute("del", "h_justin", cb);
}

// 封装Script方法设置正数值
function test_setPositive() {
    //var hkey, k, v, skey, value;
    //
    //var hincrby_positive = fs.readFileSync("hincrby_positive.lua");
    //var hincrby_positive_sha1 = require("crypto").createHash("sha1").update(hincrby_positive).digest('hex');
    //var incrby_positive = fs.readFileSync("incrby_positive.lua");
    //var incrby_positive_sha1 = require("crypto").createHash("sha1").update(incrby_positive).digest('hex');
    //
    //hkey = "h_justin";
    //k = "score";
    //v = 300;
    //pool.execute("evalsha", hincrby_positive_sha1, 1, hkey, k, v, function (err, data) {
    //    if (err && err.message == 'NOSCRIPT No matching script. Please use EVAL.') {
    //        console.log("hkey no sha1 [%s] using eval", hincrby_positive_sha1);
    //        pool.execute("eval", hincrby_positive, 1, hkey, k, v, cb);
    //        return;
    //    }
    //    cb(err, data);
    //});
    //
    //skey = "justin";
    //value = 1000;
    //pool.execute("evalsha", incrby_positive_sha1, 1, skey, value, function (err, data) {
    //    if (err && err.message == 'NOSCRIPT No matching script. Please use EVAL.') {
    //        console.log("skey no sha1 [%s] using eval", incrby_positive_sha1);
    //        pool.execute("eval", incrby_positive, 1, skey, value, cb);
    //        return;
    //    }
    //    cb(err, data);
    //});

    // 因为zz-redis底层已经对 eval 方法做了相应的封装, 所以此处无需在进行操作.
    var hkey, k, v, skey, value;

    var hincrby_positive = fs.readFileSync("hincrby_positive.lua");
    var incrby_positive = fs.readFileSync("incrby_positive.lua");

    hkey = "h_justin";
    k = "score";
    v = 300;
    pool.execute("eval", hincrby_positive, 1, hkey, k, v, cb);

    skey = "justin";
    value = 1000;
    pool.execute("eval", incrby_positive, 1, skey, value, cb);
}

// 封装Script方法设置较大值
function test_setLarger() {
    var hkey, k, v, skey, value;

    var hset_larger = fs.readFileSync("hset_larger.lua");
    var set_larger = fs.readFileSync("set_larger.lua");

    k = "large_score";
    v = 103;
    pool.execute("eval", hset_larger, 1, hkey, k, v, cb);

    skey = "justin";
    value = 118;
    pool.execute("eval", set_larger, 1, skey, value, cb);
}

// 调用Multi方法
function test_multi() {
    pool.multi(function (err, multi) {
        multi.set("justin", 1200);
        multi.incr("justin");
        setTimeout(function () {
            multi.get("justin");
            multi.exec(cb);
        }, 3000);
    });
}

function test_binary() {
    pool.execute("hset", "testHash", "k1", new Buffer("This Is Buffer O(∩_∩)O哈哈~"), buf_cb);
    pool.execute("hget", "testHash", "k1", buf_cb);
}

//test_string();
//test_list();
//test_hash();
//test_setPositive();
//test_setLarger();


