import z from "zod";

export const validUrl = /^(?!.*(https?:\/\/)?([a-zA-Z0-9-]+\.)?saintkappa\.dev(\/.*)?)(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})+\/?[a-zA-Z0-9\-_]*\/?$/i;

export const snipUrlSchema = z.string().regex(validUrl, { message: "Invalid URL" });
export const snipIdSchema = z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "ID can only contain letters, numbers, hyphens, and underscores" });

export const formSchema = (useCustomId: boolean) => z.object({ url: snipUrlSchema, id: useCustomId ? snipIdSchema : z.string().optional() });
export const apiSchema = z.object({ url: snipUrlSchema, id: snipIdSchema.optional() });
