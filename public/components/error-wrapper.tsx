import { Separator } from "@public/components/ui/separator";

export function ErrorWrapper({ code, message }: { code: number; message: string }) {
    return (
        <div className="flex items-center gap-4 h-14">
            <h2 className="text-2xl font-bold">{code}</h2>
            <Separator orientation="vertical" />
            <h1 className="text-sm">{message || "An unknown error occurred."}</h1>
        </div>
    );
}
