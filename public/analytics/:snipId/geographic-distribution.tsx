import { Button } from "@public/components/ui/button";
import { ButtonGroup } from "@public/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { ScrollArea } from "@public/components/ui/scroll-area";
import type { AnalyticsData } from "@public/lib/types";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import GeoJSON from "./geo.json";

const initialPosition = { coordinates: [23, 10] as [number, number], zoom: 1.15 };

export function GeographicDistribution({ countries }: { countries: AnalyticsData["metrics"]["countries"]["total"] }) {
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState(initialPosition);
    const [isPanning, setIsPanning] = useState(false);

    const { mappedData, maxClicks } = useMemo(() => {
        const mappedData: Record<string, number> = {};
        let maxClicks = 0;

        for (const [code, count] of Object.entries(countries)) {
            mappedData[code] = count;
            if (count > maxClicks) maxClicks = count;
        }
        return { mappedData, maxClicks };
    }, [countries]);

    const handleZoomIn = () => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 10) }));
    const handleZoomOut = () => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
    const handleReset = () => setPosition(initialPosition);
    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
        setIsPanning(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Clicks by country</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative flex lg:flex-row flex-col gap-4">
                <div className="lg:flex-3 relative border border-dashed rounded-md overflow-hidden">
                    <ComposableMap className={`size-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}>
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveStart={() => setIsPanning(true)}
                            onMoveEnd={handleMoveEnd}
                            translateExtent={[
                                [0, -50],
                                [900, 575],
                            ]}
                        >
                            <Geographies geography={GeoJSON}>
                                {({ geographies }: { geographies: typeof GeoJSON.objects.world.geometries }) =>
                                    geographies.map((geo) => {
                                        const countryCode = geo.id;
                                        const count = mappedData[countryCode] || 0;
                                        const opacity = maxClicks > 0 ? 0.3 + (count / maxClicks) * 0.7 : 0.3;

                                        return (
                                            <Geography
                                                key={geo.id}
                                                geography={geo}
                                                fill={count > 0 ? "var(--chart-1)" : "var(--muted)"}
                                                fillOpacity={count > 0 ? opacity : 0.5}
                                                stroke="var(--card)"
                                                strokeWidth={0.6}
                                                style={{ default: { outline: "none" }, pressed: { outline: "none" }, hover: { fillOpacity: 1, outline: "none" } }}
                                                onMouseEnter={() => setTooltipContent(`${geo.properties.name}: ${count} clicks`)}
                                                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                                                onMouseLeave={() => setTooltipContent(null)}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                    <div className="absolute bottom-2 right-2 space-y-1">
                        <Button variant="map" size="icon-sm" onClick={handleReset}>
                            <RotateCcw />
                            <span className="sr-only">Reset map position</span>
                        </Button>
                        <ButtonGroup orientation="vertical" aria-label="Map zoom controls">
                            <Button variant="map" size="icon-sm" onClick={handleZoomIn}>
                                <Plus />
                                <span className="sr-only">Zoom in</span>
                            </Button>
                            <Button variant="map" size="icon-sm" onClick={handleZoomOut}>
                                <Minus />
                                <span className="sr-only">Zoom out</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                {tooltipContent && !isPanning && (
                    <div className="fixed z-10 px-2 py-1 text-xs text-primary bg-background rounded shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2.5" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
                        {tooltipContent}
                    </div>
                )}
                <ScrollArea className="lg:flex-1 min-w-0 overflow-hidden lg:max-h-max max-h-45 pr-3">
                    {Object.entries(countries)
                        .sort((a, b) => b[1] - a[1])
                        .map(([countryCode, value]) => (
                            <div key={countryCode} className="flex justify-between text-sm">
                                <span className="text-muted-foreground truncate">{countryCode !== "XX" ? GeoJSON.objects.world.geometries.find((geo) => geo.id === countryCode)?.properties.name : "Unknown"}</span>
                                <span className="font-bold">{value}</span>
                            </div>
                        ))}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
