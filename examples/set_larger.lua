local dbdata = redis.pcall('get', KEYS[1]);
if dbdata == false then
    dbdata = 0;
elseif type(dbdata) == 'table' then
    return redis.error_reply(dbdata);
end

if tonumber(dbdata) < tonumber(ARGV[1]) then
    -- always OK if without EX,NX options
    redis.pcall("set", KEYS[1], ARGV[1]);
    return 1;
else
    return 0;
end
