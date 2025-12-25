import z from "zod";

const disallowedDomains = ["saintkappa.dev"];
export const snipUrlSchema = z
    .string()
    .trim()
    .min(1, { error: "URL is required", abort: true })
    .transform((value) => (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value) ? value : `https://${value}`))
    .pipe(z.url({ error: "Invalid URL", abort: true, normalize: true, protocol: /^https?$/, hostname: z.regexes.domain }))
    .refine(
        (url) => {
            try {
                const { hostname } = new URL(url);
                return !disallowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
            } catch {
                return true;
            }
        },
        { error: "You can't do that" },
    );

export const snipIdSchema = z
    .string()
    .min(3, { message: "Snip ID must be at least 3 characters long" })
    .max(64, { message: "Snip ID must be at most 64 characters long" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Snip ID can only contain letters, numbers, hyphens, and underscores" });

export const expirationSchema = z.number().refine((val) => val > Math.floor(Date.now() / 1000), { message: "Expiration must be in the future" });

export const formSchema = ({ useCustomId, useExpiration }: { useCustomId: boolean; useExpiration: boolean }) => z.object({ url: snipUrlSchema, id: useCustomId ? snipIdSchema : z.string().optional(), expiration: useExpiration ? expirationSchema : z.number().optional() });
export const apiSchema = z.object({ url: snipUrlSchema, id: snipIdSchema.optional(), expiration: expirationSchema.optional() });
