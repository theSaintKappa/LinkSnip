import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@public/components/ui/button";
import { Field, FieldError, FieldGroup } from "@public/components/ui/field";
import { Input } from "@public/components/ui/input";
import { Label } from "@public/components/ui/label";
import { Separator } from "@public/components/ui/separator";
import { Switch } from "@public/components/ui/switch";
import { api } from "@public/lib/api";
import { formSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";

export function SnipForm({ onSuccess }: { onSuccess: (url: string) => void }) {
    const [useCustomId, setUseCustomId] = useState(false);
    const [loading, setLoading] = useState(false);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        urlInputRef.current?.focus();
    }, []);

    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema(useCustomId)),
        defaultValues: { url: "", id: "" },
    });

    async function onSubmit({ url, id }: z.infer<ReturnType<typeof formSchema>>) {
        setLoading(true);
        try {
            const { data, error } = await api.snip.post({ url, id: useCustomId ? id : undefined });
            if (error) {
                if (error.status === 409) form.setError("id", { message: "This Snip ID is already taken by another URL." });
                else form.setError("url", { message: "An error occurred while creating the snip. Please try again." });
                return;
            }
            const snipUrl = `${window.location.origin}/${data.id}`;
            try {
                await navigator.clipboard.writeText(snipUrl);
            } catch (e) {
                console.warn("Failed to copy to clipboard automatically:", e);
            }
            onSuccess(snipUrl);
            form.reset();
        } catch (error) {
            console.error(error);
            form.setError("url", { message: "An unexpected error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    const handleCustomIdChange = (checked: boolean) => {
        setUseCustomId(checked);
        if (checked) {
            setTimeout(() => idInputRef.current?.focus(), 0);
            return;
        }
        form.clearErrors("id");
        setTimeout(() => urlInputRef.current?.focus(), 0);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
                <Controller
                    name="url"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input {...field} className="placeholder:font-mono placeholder:text-muted" type="text" placeholder="Your loooong URL" autoComplete="off" aria-invalid={fieldState.invalid} ref={urlInputRef} />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="flex items-center space-x-2">
                    <Switch id="id" checked={useCustomId} onCheckedChange={handleCustomIdChange} />
                    <Label className="cursor-pointer" htmlFor="id">
                        Use custom Snip ID
                    </Label>
                </div>
                {useCustomId && (
                    <Controller
                        name="id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <Input {...field} className="placeholder:font-mono placeholder:text-muted" type="text" placeholder="Snip ID" autoComplete="off" aria-invalid={fieldState.invalid} ref={idInputRef} />
                                {fieldState.invalid && <FieldError className="" errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                )}
                <Separator />
                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin size-5" /> : "Snip it!"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
