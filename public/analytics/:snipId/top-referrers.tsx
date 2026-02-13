import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@public/components/ui/card";
import { Progress } from "@public/components/ui/progress";
import { ScrollArea } from "@public/components/ui/scroll-area";
import type { AnalyticsData } from "@public/lib/types";

export function TopReferrers({ referrers }: { referrers: AnalyticsData["metrics"]["referrers"]["total"] }) {
    console.log(referrers);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Where the clicks are coming from</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden flex-1">
                {Object.keys(referrers).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data to display</div>
                ) : (
                    <ScrollArea className="h-full lg:max-h-max max-h-60">
                        <div className="space-y-4 pr-3">
                            {Object.entries(referrers)
                                .sort((a, b) => b[1] - a[1])
                                .map(([referrer, count], index) => {
                                    const percentage = (count / Object.values(referrers).reduce((a, b) => a + b, 0)) * 100;
                                    return (
                                        <div key={referrer} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold">{index + 1}</span>
                                                    <span className="font-medium">{referrer.charAt(0).toUpperCase() + referrer.slice(1)}</span>
                                                </div>
                                                <span className="font-bold">{count}</span>
                                            </div>
                                            <Progress value={percentage} />
                                        </div>
                                    );
                                })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
