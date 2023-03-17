import { createClient } from 'redis';
import { Schema, Repository } from 'redis-om';

const redis = createClient({ url: process.env.REDIS_URI });
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect();

const snipSchema = new Schema('Snip', {
    snipId: { type: 'string' },
    snipUrl: { type: 'string' },
    redirectUrl: { type: 'string' },
    createdAt: { type: 'date' },
});

export const snipRepository = new Repository(snipSchema, redis);

await snipRepository.createIndex();
