import { ANALYTICS_RETENTION_SECONDS } from "@server/lib/analytics";
import { redis } from "@server/lib/db";
import { apiSchema } from "@shared/schema";
import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import type { SetOptions } from "redis";

export const snipRoute = new Elysia({ prefix: "/api/snip" }).post(
    "/",
    async ({ body: { url, id, expireAt, enableAnalytics }, status }) => {
        try {
            let isCustom = false;
            if (id) {
                isCustom = true;
                const [existingUrl, existingCustomUrl] = await redis.mGet([`id:${id}`, `id:${id}:custom`]);
                if (existingUrl || existingCustomUrl) {
                    if (existingUrl === url || existingCustomUrl === url) return { id, url, alreadyExists: true };
                    return status(409, { error: "Custom ID is already taken by a different URL" });
                }
            } else {
                const existingId = await redis.get(`url:${url}`);
                if (existingId) {
                    const currentExpireTime = await redis.expireTime(`url:${url}`);
                    if ((!expireAt && currentExpireTime === -1) || (expireAt && currentExpireTime === expireAt)) return { id: existingId, url, alreadyExists: true };
                }

                id = nanoid(3);
                let tries = 0;
                while (await redis.exists([`id:${id}`, `id:${id}:custom`])) {
                    if (tries >= 10) throw new Error("Failed to generate a unique ID");
                    id = nanoid(3);
                    tries++;
                }
            }

            const expirationOption = expireAt ? ({ expiration: { type: "EXAT", value: expireAt } } as SetOptions) : undefined;
            const pipeline = redis.multi();

            if (isCustom) {
                pipeline.set(`id:${id}:custom`, url, expirationOption);
                pipeline.set(`url:${url}:custom`, id, expirationOption);
            } else {
                pipeline.set(`id:${id}`, url, expirationOption);
                pipeline.set(`url:${url}`, id, expirationOption);
            }
            pipeline.hSet(`snip:${id}:meta`, { track: enableAnalytics ? "1" : "0", createdAt: Math.floor(Date.now() / 1000).toString(), ttl: expireAt ? expireAt.toString() : "" });
            if (expireAt) pipeline.expireAt(`snip:${id}:meta`, expireAt + ANALYTICS_RETENTION_SECONDS);

            await pipeline.exec();

            return { id, url, expireAt: expireAt ?? null, analyticsEnabled: enableAnalytics, alreadyExists: false };
        } catch (error) {
            console.error(error);
            return status(500, { error: "Internal Server Error" });
        }
    },
    {
        body: apiSchema,
        response: {
            200: t.Object({ id: t.String(), url: t.String(), expireAt: t.Nullable(t.Number()), analyticsEnabled: t.Boolean(), alreadyExists: t.Boolean() }),
            409: t.Object({ error: t.String() }),
            500: t.Object({ error: t.String() }),
            422: t.Object({}),
        },
    },
);
