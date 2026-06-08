require('dotenv').config({ path: '.env.local' });
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
console.log('Testing connection to Redis Cloud...');

const redis = new Redis(redisUrl);

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully!');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

async function test() {
    try {
        await redis.set('test_key', 'Hello from Studio1!');
        const val = await redis.get('test_key');
        console.log('✅ Read/Write test passed! Value retrieved:', val);
        await redis.del('test_key');
        console.log('✅ Cleaned up test key. Everything is working perfectly!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Test failed:', e.message);
        process.exit(1);
    }
}

setTimeout(test, 1000); // wait for connection
