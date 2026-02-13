import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@public/components/ui/chart";
import type { AnalyticsData } from "@public/lib/types";
import { Pie, PieChart } from "recharts";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
    tablet: {
        label: "Tablet",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

export function DeviceDistribution({ devices }: { devices: AnalyticsData["metrics"]["devices"]["total"] }) {
    const chartData = Object.entries(devices).map(([device, count]) => ({ device, count, fill: `var(--color-${device})` }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Clicks by device type</CardDescription>
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
