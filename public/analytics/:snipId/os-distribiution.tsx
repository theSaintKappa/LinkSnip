import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@public/components/ui/chart";
import type { AnalyticsData } from "@public/lib/types";
import { Pie, PieChart } from "recharts";

export function OSDistribution({ operatingSystems }: { operatingSystems: AnalyticsData["metrics"]["os"]["total"] }) {
    const sortedOperatingSystems = Object.entries(operatingSystems).sort((a, b) => b[1] - a[1]);
    const chartConfig = Object.fromEntries(sortedOperatingSystems.map(([os], index) => [os, { label: os, color: `var(--chart-${(index % 5) + 1})` }])) satisfies ChartConfig;
    const chartData = sortedOperatingSystems.map(([os, count]) => ({ os, count, fill: `var(--color-${os})` }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>OS Distribution</CardTitle>
                <CardDescription>Clicks by operating system</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Pie data={chartData} dataKey="count" nameKey="os" />
                        <ChartLegend className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" content={<ChartLegendContent nameKey="os" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
