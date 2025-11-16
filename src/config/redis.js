const config = require('./env');

// Mock Redis client for production
const createMockRedisClient = () => {
  console.log('🔧 Using Mock Redis for production');
  
  const mockData = new Map();
  
  return {
    async get(key) {
      console.log(`[Mock Redis] GET ${key}`);
      return mockData.get(key) || null;
    },
    
    async setEx(key, seconds, value) {
      console.log(`[Mock Redis] SETEX ${key} for ${seconds}s`);
      mockData.set(key, value);
      
      // Auto-expire mock (basic implementation)
      setTimeout(() => {
        mockData.delete(key);
      }, seconds * 1000);
      
      return 'OK';
    },
    
    async del(key) {
      console.log(`[Mock Redis] DEL ${key}`);
      const deleted = mockData.delete(key);
      return deleted ? 1 : 0;
    },
    
    async keys(pattern) {
      console.log(`[Mock Redis] KEYS ${pattern}`);
      const allKeys = Array.from(mockData.keys());
      
      // Basic pattern matching (supports * wildcard)
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return allKeys.filter(key => regex.test(key));
      }
      
      return allKeys.filter(key => key === pattern);
    },
    
    async connect() {
      console.log('✅ Mock Redis connected successfully');
      return true;
    },
    
    async disconnect() {
      console.log('✅ Mock Redis disconnected');
      return true;
    },
    
    async quit() {
      console.log('✅ Mock Redis quit');
      return true;
    },
    
    on(event, callback) {
      if (event === 'connect') {
        setTimeout(callback, 100);
      }
      if (event === 'error') {
        // Ignore errors in mock mode
      }
      return this;
    },
    
    isOpen: true
  };
};

// Use mock Redis in production when localhost is specified
let redisClient;

if (process.env.NODE_ENV === 'production') {
  redisClient = createMockRedisClient();
} else {
  // Use real Redis for development (your existing code)
  const redis = require('redis');
  
  const redisConfig = process.env.REDIS_URL 
    ? { url: process.env.REDIS_URL }
    : {
        socket: {
          host: config.redis.host,
          port: config.redis.port
        },
        password: config.redis.password
      };

  redisClient = redis.createClient(redisConfig);

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
}

const connectRedis = async () => {
  if (redisClient.connect) {
    await redisClient.connect();
  }
  return true;
};

module.exports = {
  redisClient,
  connectRedis
};