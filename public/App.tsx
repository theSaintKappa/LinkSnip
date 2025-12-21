import { SnipForm } from "@public/components/snip-form";
import { SnipResult } from "@public/components/snip-result";
import { Scissors } from "lucide-react";
import { useState } from "react";

export function App() {
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

    return (
        <main className="flex flex-col justify-center items-center p-8 h-screen supports-[height:100dvh]:h-dvh">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1">
                    <div className="flex justify-center items-center gap-2">
                        <Scissors className="size-11 shrink-0 stroke-3" />
                        <h1 className="text-5xl sm:text-6xl font-black text-center">
                            LinkSnip<span className="text-base font-extralight ml-0.5">v2</span>
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-center text-muted-foreground text-balance">
                        Shorten your long URLs <span className="italic font-medium">blazingly fast 🔥</span>
                    </p>
                </div>
                {shortenedUrl ? <SnipResult shortenedUrl={shortenedUrl} onBack={() => setShortenedUrl(null)} /> : <SnipForm onSuccess={setShortenedUrl} />}
            </div>
        </main>
    );
}
