/**
 * FileName: index-back
 * Created by "Justin Chou <zhou78620051@126.com>".
 * On Date: 7/31/2014.
 * At Time: 5:11 PM
 */

var redis = require("../index").classic;
var config = require("./cfg/redisConf");

redis.createRedis(config);

var cb = function () {
    console.log(arguments);
}

redis.execute("cache", function (client, release) {
    client.set("justin", "chou", cb);
    client.lpush("l_justin", "chou", "hah", "55", "77", cb);

    var args = ["l_justin", "chou", "hah", "55", "77", cb];
    client.lpush.apply(client, args);

    client.hmset("h_justin", {"username": "jsutin", "sex": 1, "age": 22, "position": "Beijing"}, function () {
        console.log("hmset %j", arguments);
    });

    var multi = client.multi();
    ["age", "sex", "color"].forEach(function(key){
        multi.hdel("h_justin", key);
    });
    multi.exec(cb);

    client.hgetall("h_justin", function () {
        console.log("hgetall %j", arguments);
    });

    setTimeout(function () {
        release();
    }, 10000);
});