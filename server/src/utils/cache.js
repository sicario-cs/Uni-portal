const redis = require("../config/db.redis");

// حفظ الكاش
async function setCache(key, value, ttl = 3600) {
  await redis.set(key, JSON.stringify(value), { EX: ttl });
}

// جلب بيانات من الكاش
async function getCache(key) {
  const cache = await redis.get(key);
  return cache ? JSON.parse(cache) : null;
}

// حذف كاش
async function deleteCache(key) {
  await redis.del(key);
}

module.exports = {
  setCache,
  getCache,
  deleteCache
};
