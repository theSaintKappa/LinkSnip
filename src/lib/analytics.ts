import crypto from "node:crypto";
import { redis } from "@server/lib/db";
import { geo } from "@server/lib/geo";
import { UAParser } from "ua-parser-js";
import { isAIAssistant, isAICrawler, isBot } from "ua-parser-js/bot-detection";

export const ANALYTICS_RETENTION_SECONDS = process.env.ANALYTICS_RETENTION_DAYS ? parseInt(process.env.ANALYTICS_RETENTION_DAYS, 10) * 24 * 60 * 60 : 14 * 24 * 60 * 60; // Default to 14 days

export async function trackClick(snipId: string, request: Request, ip: string) {
    const track = await redis.hGet(`snip:${snipId}:meta`, "track");
    if (track !== "1") return;

    const ua = request.headers.get("user-agent") || "";
    if (isBot(ua) || isAICrawler(ua) || isAIAssistant(ua)) return;

    const result = new UAParser(ua).getResult();

    const fingerprint = hashFingerprint(ip + ua);
    const referer = normalizeReferer(request.headers.get("referer"));
    const device = result.device.type || "desktop";
    const browser = result.browser.name || "unknown";
    const os = result.os.name || "unknown";
    const country = geo.lookupCountry(ip);

    const base = `snip:${snipId}`;
    const dateKey = getDateKey();
    const pipeline = redis.multi();

    pipeline.incr(`${base}:clicks:${dateKey}`);
    pipeline.pfAdd(`${base}:uniques:${dateKey}`, fingerprint);
    pipeline.hIncrBy(`${base}:referrers:${dateKey}`, referer, 1);
    pipeline.hIncrBy(`${base}:devices:${dateKey}`, device, 1);
    pipeline.hIncrBy(`${base}:browsers:${dateKey}`, browser, 1);
    pipeline.hIncrBy(`${base}:os:${dateKey}`, os, 1);
    pipeline.hIncrBy(`${base}:countries:${dateKey}`, country, 1);

    pipeline.expire(`${base}:clicks:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:uniques:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:referrers:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:devices:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:browsers:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:os:${dateKey}`, ANALYTICS_RETENTION_SECONDS);
    pipeline.expire(`${base}:countries:${dateKey}`, ANALYTICS_RETENTION_SECONDS);

    await pipeline.exec();
}

function hashFingerprint(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function normalizeReferer(ref?: string | null) {
    if (!ref) return "direct";
    try {
        return new URL(ref).hostname;
    } catch {
        return "unknown";
    }
}
