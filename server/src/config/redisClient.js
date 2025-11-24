const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://redis_db:6379"  // ← اسم الـ container عندك
});

redisClient.connect().catch(console.error);

redisClient.on("connect", () => {
  console.log("Redis Session Store Connected");
});

module.exports = redisClient;
