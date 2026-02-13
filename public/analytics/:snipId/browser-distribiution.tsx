import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@public/components/ui/chart";
import type { AnalyticsData } from "@public/lib/types";
import { Pie, PieChart } from "recharts";

export function BrowserDistribution({ browsers }: { browsers: AnalyticsData["metrics"]["browsers"]["total"] }) {
    const sortedBrowsers = Object.entries(browsers).sort((a, b) => b[1] - a[1]);
    const chartConfig = Object.fromEntries(sortedBrowsers.map(([browser], index) => [browser, { label: browser, color: `var(--chart-${(index % 5) + 1})` }])) satisfies ChartConfig;
    const chartData = sortedBrowsers.map(([browser, count]) => ({ device: browser, count, fill: `var(--color-${browser})` }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Browser Distribution</CardTitle>
                <CardDescription>Clicks by browser</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Pie data={chartData} dataKey="count" nameKey="device" />
                        <ChartLegend className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" content={<ChartLegendContent nameKey="device" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
