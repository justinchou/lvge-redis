Redis
===============

Redis Connection Pool

Usage:

1. 引入模块:

    var redis = require("lvge-redis");

2. 加载配置文件, 连接Redis:

    var config = require("./cfg/redisConf");
    var pool = redis.connect_with_easy_pool(config);

3. 使用连接池

使用String

    pool.execute("set", "justin", "mimi0", "EX", 10, "NX", cb);
    pool.execute("set", "justin", "mimi1", "PX", 10000, cb);
    pool.execute("set", "justin", "mimi2", "NX", cb);
    pool.execute("set", "justin", "mimi3", "XX", cb);
    pool.execute("get", "justin", cb);

    pool.execute("set", "justin", false, cb);   // 将存储成"false"字符串, true将存储成"true"字符串
    pool.execute("get", "justin", cb);
    pool.execute("del", "justin", cb);

使用List

    pool.execute("lpush", "l_justin", "11", "22", 33, 44, cb);
    pool.execute("lrange", "l_justin", 0, -1, cb);
    pool.execute("del", "l_justin", cb);

    var handler = ["lpush"], key = ["l_justin"], values = [1, 2, 3, 4, 5, 6];
    values = handler.concat(key, values, cb);
    console.log(values);
    pool.execute.apply(pool, values);
    pool.execute("lrange", "l_justin", 0, -1, cb);
    pool.execute("del", "l_justin", cb);


使用Hash列表

    pool.execute("hmset", "h_justin", {"name": "mimi", "age": 20}, cb);
    pool.execute("hmset", "h_justin", "hair", "black", "glass", 1, cb);
    pool.execute("hset", "h_justin", "sex", "man", cb);
    pool.execute("hgetall", "h_justin", cb);
    pool.execute("hdel", "h_justin", "age", cb);
    pool.execute("hgetall", "h_justin", cb);
    pool.execute("del", "h_justin", cb);




使用Lua脚本用例1

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




使用Lua脚本用例2

    var hkey, k, v, skey, value;

    var hset_larger = fs.readFileSync("hset_larger.lua");
    var set_larger = fs.readFileSync("set_larger.lua");

    k = "large_score";
    v = 103;
    pool.execute("eval", hset_larger, 1, hkey, k, v, cb);

    skey = "justin";
    value = 118;
    pool.execute("eval", set_larger, 1, skey, value, cb);



使用Multi

    pool.multi(function (err, multi) {
        multi.set("justin", 1200);
        multi.incr("justin");
        setTimeout(function () {
            multi.get("justin");
            multi.exec(cb);
        }, 3000);
    });



