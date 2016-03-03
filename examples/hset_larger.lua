local dbdata = redis.pcall('hget', KEYS[1], ARGV[1]);
if dbdata == false then
    dbdata = 0;
elseif type(dbdata) == 'table' then
    return redis.error_reply(dbdata);
end

if tonumber(dbdata) < tonumber(ARGV[2]) then
    return redis.pcall("hset", KEYS[1], ARGV[1], ARGV[2]);
else
    return 0;
end
