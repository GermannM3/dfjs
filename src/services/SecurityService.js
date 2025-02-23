const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const axios = require('axios');

const redis = new Redis(process.env.REDIS_URL);

class SecurityService {
  static createRateLimiter(windowMs = 15 * 60 * 1000, max = 100) {
    return rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      store: {
        incr: (key) => redis.incr(key),
        decr: (key) => redis.decr(key),
        resetKey: (key) => redis.del(key)
      }
    });
  }

  static async checkMultiaccounting(userId, ip) {
    const key = `user:${userId}:ips`;
    const userIps = await redis.smembers(key);
    
    if (userIps.length >= 3 && !userIps.includes(ip)) {
      throw new Error('Multiple account detection');
    }
    
    await redis.sadd(key, ip);
    await redis.expire(key, 60 * 60 * 24 * 7); // 7 days
  }

  static async validateIp(ip) {
    try {
      // Using free IP-API service
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      return {
        country: response.data.country,
        city: response.data.city,
        isp: response.data.isp,
        proxy: response.data.proxy || false
      };
    } catch (error) {
      console.error('IP validation error:', error);
      return null;
    }
  }
}

module.exports = SecurityService;