import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Dayjs } from "./dayjs";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function humanizeDiff(from: Dayjs, to: Dayjs): string {
    if (to.isBefore(from)) return "Expired";

    const diffMs = to.diff(from);
    const totalMinutes = Math.round(diffMs / 60000);

    if (totalMinutes === 0) return "less than a minute";

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = ["Expires in"];

    if (days === 1 && hours === 0 && minutes === 0) {
        parts.push("24 hours");
    } else {
        if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
        if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
        if (minutes) {
            if (days || hours) parts.push("and");
            parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
        }
    }

    parts.push("from now");

    return parts.join(" ");
}

export const publicAppUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:3000";
try {
    void new URL(publicAppUrl);
} catch {
    throw new Error("PUBLIC_APP_URL is not a valid URL");
}
