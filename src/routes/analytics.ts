import { redis } from "@server/lib/db";
import Elysia, { t } from "elysia";

const RETENTION_DAYS = process.env.ANALYTICS_RETENTION_DAYS ? parseInt(process.env.ANALYTICS_RETENTION_DAYS, 10) : 14;

export const analyticsRoute = new Elysia({ prefix: "/api/analytics" }).get(
    "/:snipId",
    async ({ params: { snipId }, status }) => {
        try {
            const [url, customUrl] = await redis.mGet([`id:${snipId}`, `id:${snipId}:custom`]);
            const finalUrl = customUrl || url;
            if (!finalUrl) return status(404, { error: "NOT_FOUND" });

            const meta = await redis.hGetAll(`snip:${snipId}:meta`);
            if (meta.track !== "1") return status(403, { error: "ANALYTICS_DISABLED" });

            const now = new Date();
            const dates = Array.from({ length: RETENTION_DAYS }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                return d.toISOString().slice(0, 10);
            }).reverse();

            const pipeline = redis.multi();
            const base = `snip:${snipId}`;

            for (const date of dates) {
                pipeline.get(`${base}:clicks:${date}`);
                pipeline.pfCount(`${base}:uniques:${date}`);
                pipeline.hGetAll(`${base}:referrers:${date}`);
                pipeline.hGetAll(`${base}:devices:${date}`);
                pipeline.hGetAll(`${base}:browsers:${date}`);
                pipeline.hGetAll(`${base}:os:${date}`);
                pipeline.hGetAll(`${base}:countries:${date}`);
            }

            const uniqueKeys = dates.map((date) => `${base}:uniques:${date}`);
            pipeline.pfCount(uniqueKeys);

            const results = await pipeline.exec();

            const response = {
                snip: { id: snipId, redirectTo: finalUrl, expiresAt: meta.expiresAt || null, createdAt: meta.createdAt || null },
                metrics: {
                    retentionDays: RETENTION_DAYS,
                    clicks: { total: { count: 0 }, timeseries: [] as { date: string; data: { count: number } }[] },
                    uniques: { total: { count: 0 }, timeseries: [] as { date: string; data: { count: number } }[] },
                    referrers: { total: {} as Record<string, number>, timeseries: [] as { date: string; data: Record<string, number> }[] },
                    devices: { total: {} as Record<string, number>, timeseries: [] as { date: string; data: Record<string, number> }[] },
                    browsers: { total: {} as Record<string, number>, timeseries: [] as { date: string; data: Record<string, number> }[] },
                    os: { total: {} as Record<string, number>, timeseries: [] as { date: string; data: Record<string, number> }[] },
                    countries: { total: {} as Record<string, number>, timeseries: [] as { date: string; data: Record<string, number> }[] },
                },
            };

            const sumObjects = (target: Record<string, number>, source: Record<string, string>) => {
                const numericSource: Record<string, number> = {};
                for (const [key, value] of Object.entries(source)) {
                    const num = parseInt(value, 10) || 0;
                    target[key] = (target[key] || 0) + num;
                    numericSource[key] = num;
                }
                return numericSource;
            };

            for (let i = 0; i < dates.length; i++) {
                const date = dates[i];
                const baseIdx = i * 7;

                const clicks = parseInt((results[baseIdx] as unknown as string) || "0", 10);
                const uniques = (results[baseIdx + 1] as unknown as number) || 0;
                const referrers = (results[baseIdx + 2] as unknown as Record<string, string>) || {};
                const devices = (results[baseIdx + 3] as unknown as Record<string, string>) || {};
                const browsers = (results[baseIdx + 4] as unknown as Record<string, string>) || {};
                const os = (results[baseIdx + 5] as unknown as Record<string, string>) || {};
                const countries = (results[baseIdx + 6] as unknown as Record<string, string>) || {};

                response.metrics.clicks.total.count += clicks;
                response.metrics.clicks.timeseries.push({ date, data: { count: clicks } });

                response.metrics.uniques.timeseries.push({ date, data: { count: uniques } });

                const referrersData = sumObjects(response.metrics.referrers.total, referrers);
                response.metrics.referrers.timeseries.push({ date, data: referrersData });

                const devicesData = sumObjects(response.metrics.devices.total, devices);
                response.metrics.devices.timeseries.push({ date, data: devicesData });

                const browsersData = sumObjects(response.metrics.browsers.total, browsers);
                response.metrics.browsers.timeseries.push({ date, data: browsersData });

                const osData = sumObjects(response.metrics.os.total, os);
                response.metrics.os.timeseries.push({ date, data: osData });

                const countriesData = sumObjects(response.metrics.countries.total, countries);
                response.metrics.countries.timeseries.push({ date, data: countriesData });
            }

            const totalUniques = (results[results.length - 1] as unknown as number) || 0;
            response.metrics.uniques.total.count = totalUniques;

            return response;
        } catch (error) {
            console.error(error);
            return status(500, { error: "INTERNAL_SERVER_ERROR" });
        }
    },
    {
        response: {
            200: t.Object({
                snip: t.Object({ id: t.String(), redirectTo: t.String(), expiresAt: t.Nullable(t.String()), createdAt: t.Nullable(t.String()) }),
                metrics: t.Object({
                    retentionDays: t.Number(),
                    clicks: t.Object({
                        total: t.Object({ count: t.Number() }),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Object({ count: t.Number() }) })),
                    }),
                    uniques: t.Object({
                        total: t.Object({ count: t.Number() }),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Object({ count: t.Number() }) })),
                    }),
                    referrers: t.Object({
                        total: t.Record(t.String(), t.Number()),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Record(t.String(), t.Number()) })),
                    }),
                    devices: t.Object({
                        total: t.Record(t.String(), t.Number()),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Record(t.String(), t.Number()) })),
                    }),
                    browsers: t.Object({
                        total: t.Record(t.String(), t.Number()),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Record(t.String(), t.Number()) })),
                    }),
                    os: t.Object({
                        total: t.Record(t.String(), t.Number()),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Record(t.String(), t.Number()) })),
                    }),
                    countries: t.Object({
                        total: t.Record(t.String(), t.Number()),
                        timeseries: t.Array(t.Object({ date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }), data: t.Record(t.String(), t.Number()) })),
                    }),
                }),
            }),
            403: t.Object({ error: t.String() }),
            404: t.Object({ error: t.String() }),
            500: t.Object({ error: t.String() }),
        },
    },
);
