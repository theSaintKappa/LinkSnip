import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@public/components/ui/button";
import { Calendar } from "@public/components/ui/calendar";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@public/components/ui/field";
import { Input } from "@public/components/ui/input";
import { Label } from "@public/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@public/components/ui/popover";
import { Switch } from "@public/components/ui/switch";
import { api } from "@public/lib/api";
import dayjs, { type Dayjs } from "@public/lib/dayjs";
import { humanizeDiff, publicAppUrl } from "@public/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formSchema } from "@shared/schema";
import { CalendarClock, CalendarIcon, ChartColumn, Clock, Hash, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";

const appHost = new URL(publicAppUrl).host;
const truncatedAppHost = appHost.length > 30 ? `${appHost.slice(0, 27)}...` : appHost;

export function SnipForm({ onSuccess }: { onSuccess: (url: string) => void }) {
    const [useCustomId, setUseCustomId] = useState(false);
    const [useExpiration, setUseExpiration] = useState(false);
    const [loading, setLoading] = useState(false);

    const urlInputRef = useRef<HTMLInputElement>(null);
    const customIdInputRef = useRef<HTMLInputElement>(null);

    const urlPrefixRef = useRef<HTMLSpanElement>(null);
    const [customIdInputPadding, setCustomIdInputPadding] = useState(0);
    useLayoutEffect(() => {
        if (urlPrefixRef.current && useCustomId) setCustomIdInputPadding(urlPrefixRef.current.offsetWidth + 12);
    }, [useCustomId]);

    const [expirationPickerOpen, setExpirationPickerOpen] = useState(false);
    const now = dayjs().set("second", 0).set("millisecond", 0);
    const [expiration, setExpiration] = useState<Dayjs>(now.add(1, "day"));

    useEffect(() => {
        urlInputRef.current?.focus();
    }, []);

    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema({ useCustomId, useExpiration })),
        defaultValues: { url: "", id: "" },
    });

    useEffect(() => {
        if (useExpiration && expiration) form.setValue("expiration", expiration.unix(), { shouldValidate: true });
    }, [expiration, useExpiration, form]);

    async function onSubmit({ url, id, expiration }: z.infer<ReturnType<typeof formSchema>>) {
        setLoading(true);
        try {
            const { data, error } = await api.snip.post({
                url,
                id: useCustomId ? id : undefined,
                expiration: useExpiration ? expiration : undefined,
            });
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

    const handleUseCustomId = (checked: boolean) => {
        setUseCustomId(checked);
        if (checked) {
            setTimeout(() => customIdInputRef.current?.focus(), 0);
            return;
        }
        form.clearErrors("id");
        setTimeout(() => urlInputRef.current?.focus(), 0);
    };

    const handleUseExpiration = (checked: boolean) => {
        setUseExpiration(checked);
        if (!checked) {
            form.clearErrors("expiration");
            setTimeout(() => urlInputRef.current?.focus(), 0);
        }
    };

    const handleDateChange = (date: Date | undefined) => {
        if (!expiration || !date) return;
        const dayjsDate = dayjs(date);
        setExpiration((prev) => prev.year(dayjsDate.year()).month(dayjsDate.month()).date(dayjsDate.date()));
        setExpirationPickerOpen(false);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!expiration) return;
        const [hours, minutes] = e.target.value.split(":").map(Number);
        setExpiration((prev) => prev.set("hour", hours).set("minute", minutes));
    };

    return (
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="url"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <VisuallyHidden>
                                <FieldLabel htmlFor="url-input">URL to Snip</FieldLabel>
                            </VisuallyHidden>
                            <Input {...field} type="text" placeholder="Your loooong URL" autoComplete="off" id="url-input" aria-invalid={fieldState.invalid} ref={urlInputRef} />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>
            <FieldSet className="gap-4">
                <FieldLegend variant="label" className="uppercase text-muted-foreground">
                    Advanced Options
                </FieldLegend>
                <FieldGroup className="gap-3">
                    <div className="flex items-center justify-between flex-row-reverse">
                        <Switch id="custom-id" checked={useCustomId} onCheckedChange={handleUseCustomId} />
                        <Label className="cursor-pointer" htmlFor="custom-id">
                            <Hash className="inline size-4 text-muted-foreground" />
                            Custom Snip ID
                        </Label>
                    </div>
                    {useCustomId && (
                        <Controller
                            name="id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <VisuallyHidden>
                                        <FieldLabel htmlFor="input-id">Custom Snip ID</FieldLabel>
                                    </VisuallyHidden>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground/50" ref={urlPrefixRef}>
                                            {truncatedAppHost}/
                                        </span>
                                        <Input {...field} id="input-id" type="text" placeholder="click-me" autoComplete="off" aria-invalid={fieldState.invalid} ref={customIdInputRef} style={{ paddingLeft: customIdInputPadding }} />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    )}
                </FieldGroup>
                <FieldGroup className="gap-3">
                    <div className="flex items-center justify-between flex-row-reverse">
                        <Switch id="expiration" checked={useExpiration} onCheckedChange={handleUseExpiration} />
                        <Label className="cursor-pointer" htmlFor="expiration">
                            <CalendarClock className="inline size-4 text-muted-foreground" />
                            Expiration Date
                        </Label>
                    </div>
                    {useExpiration && (
                        <Field className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
                            <VisuallyHidden>
                                <FieldLabel htmlFor="date-picker">Expiration Date</FieldLabel>
                            </VisuallyHidden>
                            <Popover open={expirationPickerOpen} onOpenChange={setExpirationPickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-between font-normal" id="date-picker">
                                        {expiration ? expiration.toDate().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Select date"}
                                        <CalendarIcon className="text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar mode="single" selected={expiration.toDate()} captionLayout="label" disabled={{ before: now.toDate() }} onSelect={handleDateChange} />
                                </PopoverContent>
                            </Popover>
                            <div className="relative flex items-center">
                                <VisuallyHidden>
                                    <FieldLabel htmlFor="time-input">Expiration Time</FieldLabel>
                                </VisuallyHidden>
                                <Input
                                    id="time-input"
                                    type="time"
                                    step="60"
                                    value={expiration ? `${expiration.get("hour").toString().padStart(2, "0")}:${expiration.get("minute").toString().padStart(2, "0")}` : ""}
                                    onChange={handleTimeChange}
                                    aria-invalid={!!form.formState.errors.expiration}
                                    className="appearance-none pr-7 shadow-xs cursor-pointer bg-background dark:bg-input/30 hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50 aria-invalid:text-destructive [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                                <Clock className="absolute right-2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {form.formState.errors.expiration ? form.formState.errors.expiration && <FieldError className="col-span-2">{form.formState.errors.expiration.message}</FieldError> : expiration && <p className="col-span-2 text-sm text-muted-foreground">{humanizeDiff(now, expiration)}</p>}
                        </Field>
                    )}
                </FieldGroup>
                <div className="flex items-center justify-between flex-row-reverse">
                    <Switch id="track-usage" disabled />
                    <Label className="cursor-pointer" htmlFor="track-usage">
                        <ChartColumn className="inline size-4 text-muted-foreground" />
                        Track usage (coming soon)
                    </Label>
                </div>
            </FieldSet>
            <FieldGroup>
                <Field>
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin size-5" /> : "Snip it!"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
