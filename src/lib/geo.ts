import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { $ } from "bun";
import maxmind, { type CountryResponse, type Reader } from "maxmind";

const IS_DEV = process.env.NODE_ENV === "development";
const GEO_DIR = IS_DEV ? path.resolve(process.cwd(), ".geoip") : "/app/geo";
const DB_PATH = path.join(GEO_DIR, "GeoLite2-Country.mmdb");

let reader: Reader<CountryResponse> | null = null;

async function initialize() {
    if (reader) return reader;

    if (!existsSync(DB_PATH)) {
        if (!process.env.MAXMIND_LICENSE_KEY) {
            console.warn("MAXMIND_LICENSE_KEY not set, geo disabled");
            return null;
        }

        console.log(`GeoIP DB not found (${IS_DEV ? "dev" : "prod"}), downloading…`);

        mkdirSync(GEO_DIR, { recursive: true });

        const url = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`;

        await $`curl -sL ${url} | tar xz --strip-components=1 -C ${GEO_DIR}`;

        console.log("GeoIP DB downloaded");
    } else if (IS_DEV) {
        console.log("GeoIP DB found in dev cache, reusing");
    }

    reader = await maxmind.open<CountryResponse>(DB_PATH);
    console.log("GeoIP DB loaded");

    return reader;
}

function lookupCountry(ip: string): string {
    if (!reader) return "XX";

    try {
        const result = reader.get(ip);
        return result?.country?.iso_code ?? "XX";
    } catch {
        return "XX";
    }
}

export const geo = { initialize, lookupCountry };
