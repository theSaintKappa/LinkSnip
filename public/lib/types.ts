import type { Treaty } from "@elysiajs/eden";
import type { api } from "@public/lib/api";

export type AnalyticsData = Treaty.Data<ReturnType<typeof api.analytics>["get"]>;
export type AnalyticsError = Treaty.Error<ReturnType<typeof api.analytics>["get"]>;
