import openapi, { fromTypes } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { trackClick } from "@server/lib/analytics";
import { redis } from "@server/lib/db";
import { geo } from "@server/lib/geo";
import { analyticsRoute } from "@server/routes/analytics";
import { snipRoute } from "@server/routes/snip";
import { Elysia } from "elysia";
import { ip } from "elysia-ip";
import packageJson from "../package.json";

await redis.connect();
await geo.initialize();

const app = new Elysia()
    .use(await staticPlugin({ prefix: "/" }))
    .use(
        openapi({
            references: fromTypes(),
            exclude: { paths: ["", "/*"] },
            documentation: { info: { title: "LinkSnip API", version: packageJson.version, description: packageJson.description, license: { name: packageJson.license } } },
        }),
    )
    .use(ip())
    .use(snipRoute)
    .use(analyticsRoute)
    .get("/:snipId", async ({ params: { snipId }, redirect, status, request, ip }) => {
        try {
            const [url, customUrl] = await redis.mGet([`id:${snipId}`, `id:${snipId}:custom`]);
            const finalUrl = url || customUrl;
            if (!finalUrl) return status(404, "NOT_FOUND");

            void trackClick(snipId, request, ip);

            return redirect(finalUrl, 302);
        } catch (error) {
            console.error(error);
            return status(500, "INTERNAL_SERVER_ERROR");
        }
    })
    .listen(process.env.PORT ?? 3000);

console.log(`Elysia is running at ${app.server?.url}`);

export type App = typeof app;
