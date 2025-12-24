import openapi, { fromTypes } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { apiSchema } from "@shared/schema";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { createClient } from "redis";
import packageJson from "../package.json";

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.log("Redis Client Error", err));
await redis.connect();

const app = new Elysia()
    .use(await staticPlugin({ prefix: "/" }))
    .use(
        openapi({
            references: fromTypes(),
            exclude: { paths: ["", "/*"] },
            documentation: {
                info: {
                    title: "LinkSnip API",
                    version: packageJson.version,
                    description: packageJson.description,
                    license: { name: packageJson.license },
                },
            },
        }),
    )
    .post(
        "/api/snip",
        async ({ body: { url, id, expiration }, status }) => {
            try {
                // Add http:// if no protocol is present
                url = url.match(/^https?:\/\//) ? url : `http://${url}`;

                let isCustom = false;
                if (id) {
                    isCustom = true;
                    const existingUrl = await redis.get(`id:${id}`);
                    if (existingUrl) {
                        if (existingUrl === url) return { id, url, alreadyExists: true };
                        return status(409, { error: "Custom ID is already taken by a different URL" });
                    }
                } else {
                    const existingId = await redis.get(`url:${url}`);
                    if (existingId) return { id: existingId, url, alreadyExists: true };

                    id = nanoid(3);
                    let tries = 0;
                    while (await redis.exists(`id:${id}`)) {
                        if (tries >= 10) throw new Error("Failed to generate a unique ID");
                        id = nanoid(3);
                        tries++;
                    }
                }

                await redis.set(`id:${id}`, url, expiration ? { expiration: { type: "EXAT", value: expiration } } : undefined);
                if (isCustom) await redis.set(`url:${url}:custom`, id, expiration ? { expiration: { type: "EXAT", value: expiration } } : undefined);
                else await redis.set(`url:${url}`, id, expiration ? { expiration: { type: "EXAT", value: expiration } } : undefined);

                return { id, url, alreadyExists: false };
            } catch (error) {
                console.error(error);
                return status(500, { error: "Internal Server Error" });
            }
        },
        { body: apiSchema, response: { 200: t.Object({ id: t.String(), url: t.String(), alreadyExists: t.Boolean() }), 409: t.Object({ error: t.String() }), 500: t.Object({ error: t.String() }), 422: t.Object({}) } },
    )
    .get("/:id", async ({ params: { id }, redirect, status }) => {
        try {
            const url = await redis.get(`id:${id}`);
            if (url) return redirect(url, 302);
            return status(404, "NOT_FOUND");
        } catch (error) {
            console.error(error);
            return status(500, "INTERNAL_SERVER_ERROR");
        }
    })
    .listen(process.env.PORT ?? 3000);

console.log(`Elysia is running at ${app.server?.url}`);

export type App = typeof app;
