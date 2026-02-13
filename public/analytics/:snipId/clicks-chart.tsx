import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@public/components/ui/chart";
import type { AnalyticsData } from "@public/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
    clicks: {
        label: "Clicks",
        color: "var(--chart-1)",
    },
    uniques: {
        label: "Unique Visitors",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

export function ClicksChart({ retentionDays, clicks, uniques }: { retentionDays: number; clicks: AnalyticsData["metrics"]["clicks"]; uniques: AnalyticsData["metrics"]["uniques"] }) {
    const chartData = clicks.timeseries.map((click, index) => ({
        date: (click.date as unknown as Date).toISOString().slice(0, 10),
        clicks: click.data.count,
        uniques: uniques.timeseries[index].data.count,
    }));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Clicks & Unique Visitors</CardTitle>
                <CardDescription>Last {retentionDays} days</CardDescription>
                <CardAction>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-2xl text-chart-1 leading-none">{clicks.total.count}</span>
                            <span className="text-xs text-muted-foreground">Clicks</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-2xl text-chart-4 leading-none">{uniques.total.count}</span>
                            <span className="text-xs text-muted-foreground">Uniques</span>
                        </div>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ChartContainer config={chartConfig} className="size-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />} />
                        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
                        <Bar dataKey="uniques" fill="var(--color-uniques)" radius={4} />
                        <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
