local left = redis.pcall('hget', KEYS[1], ARGV[1]);
if left == false then
    left = 0;
elseif type(left) == 'table' then
    return redis.error_reply(left);
end

local setData = left + ARGV[2];

if setData < 0 then
    return redis.error_reply("Can NOT Hincr " .. KEYS[1] .. "." .. ARGV[1] .. ":" .. left .. " By " .. ARGV[2] .. " Get Negtive Value: " .. setData);
else
    local setResult = redis.pcall("hset", KEYS[1], ARGV[1], setData);
    return setData;
end
