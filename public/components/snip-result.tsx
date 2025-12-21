import { Button } from "@public/components/ui/button";
import { Input } from "@public/components/ui/input";
import { ChevronLeftCircle, Clipboard } from "lucide-react";
import { useEffect, useRef } from "react";
import ConfettiExplosion from "react-confetti-explosion";

const confettiProps = {
    force: 0.25,
    duration: 4000,
    particleCount: 80,
    width: 750,
};

export function SnipResult({ shortenedUrl, onBack }: { shortenedUrl: string; onBack: () => void }) {
    const resultInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (shortenedUrl && resultInputRef.current) resultInputRef.current.select();
    }, [shortenedUrl]);

    const handleCopy = () => {
        resultInputRef.current?.select();
        navigator.clipboard.writeText(shortenedUrl);
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="relative flex justify-center items-center">
                <ConfettiExplosion className="absolute" {...confettiProps} />
                <Input className="text-lg font-semibold" type="text" value={shortenedUrl} ref={resultInputRef} readOnly />
                <Button className="absolute right-0" variant="ghost" size="icon" onClick={handleCopy}>
                    <Clipboard />
                </Button>
            </div>
            <Button variant="secondary" onClick={onBack}>
                <ChevronLeftCircle className="h-5 w-5" /> Go back
            </Button>
        </div>
    );
}
