import { Client, Entity, Schema } from 'redis-om';

const client = await new Client().open(process.env.REDIS_URI);

class Snip extends Entity {}

const snipSchema = new Schema(Snip, {
    snipId: { type: 'string' },
    snipUrl: { type: 'string' },
    redirectUrl: { type: 'string' },
    createdAt: { type: 'date' },
});

export const snipRepository = client.fetchRepository(snipSchema);
