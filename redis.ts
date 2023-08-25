import { createClient } from 'redis';
import { Repository, Schema } from 'redis-om';

const redis = createClient({ url: process.env.REDIS_URI });
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect();

const snipSchema = new Schema('snip', {
    snipId: { type: 'string' },
    snipUrl: { type: 'string' },
    redirectUrl: { type: 'string' },
    createdAt: { type: 'date' },
});

export const snipRepository = new Repository(snipSchema, redis);

await snipRepository.createIndex();
