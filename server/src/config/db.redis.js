const redis = require("redis");


const redisClient = redis.createClient({
  url: "redis://redis:6379"
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

redisClient.connect();

module.exports = redisClient;

