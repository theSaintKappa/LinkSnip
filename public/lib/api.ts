import { treaty } from "@elysiajs/eden";
import type { App } from "@server";

export const { api } = treaty<App>(process.env.PUBLIC_APP_URL ?? "localhost:3000");
