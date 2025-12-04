const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://redis:6379"  
});

redisClient.connect().catch(console.error);

redisClient.on("connect", () => {
  console.log("Redis Session Store Connected");
});

module.exports = redisClient;
