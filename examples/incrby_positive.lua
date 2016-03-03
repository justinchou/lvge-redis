local left = redis.pcall('get', KEYS[1]);
if left == false then
    left = 0;
elseif type(left) == 'table' then 
    return redis.error_reply(left);
end

local setData = left + ARGV[1];

if setData < 0 then
    return redis.error_reply("Can NOT Incr " .. KEYS[1] .. ":" .. left .. " By " .. ARGV[1] .. " Get Negtive Value: " .. setData);
else
    local setResult = redis.pcall("set", KEYS[1], setData);
    return setData;
end
