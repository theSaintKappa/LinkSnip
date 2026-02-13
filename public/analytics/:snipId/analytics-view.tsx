import { ErrorWrapper } from "@public/components/error-wrapper";
import { Button } from "@public/components/ui/button";
import { api } from "@public/lib/api";
import type { AnalyticsData, AnalyticsError } from "@public/lib/types";
import { ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import useSWR from "swr";
import { BrowserDistribution } from "./browser-distribiution";
import { ClicksChart } from "./clicks-chart";
import { DeviceDistribution } from "./device-distribiution";
import { GeographicDistribution } from "./geographic-distribution";
import { OSDistribution } from "./os-distribiution";
import { TopReferrers } from "./top-referrers";

const errorMessages: Record<number, string> = {
    404: "The requested Snip was not found.",
    403: "Tracking is disabled for this Snip.",
    500: "An internal server error occurred. Please try again later.",
};

export function AnalyticsView() {
    const snipId = window.location.pathname.split("/")[2];
    const { data, isLoading, error, mutate } = useSWR<AnalyticsData, AnalyticsError>(
        ["analytics", snipId],
        async () => {
            const { data, error } = await api.analytics({ snipId }).get();
            if (error) throw error;
            return data;
        },
        { shouldRetryOnError: false },
    );

    if (isLoading)
        return (
            <div className="flex items-center gap-3">
                <Loader2 className="animate-spin size-8" />
                <h1 className="text-lg">Loading analytics...</h1>
            </div>
        );

    if (error) return <ErrorWrapper code={error.status} message={errorMessages[error.status]} />;

    if (data)
        return (
            <div className="self-start size-full max-w-7xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="lg:text-3xl text-2xl font-bold tracking-tight">
                            Analytics for <span className="text-chart-2">{data.snip.id}</span>
                        </h1>
                        <p className="flex items-center lg:gap-2 gap-1 lg:text-sm text-xs text-muted-foreground">
                            <ExternalLink className="lg:size-4 size-3" />
                            <a href={data.snip.redirectTo} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2 max-w-full truncate">
                                {data.snip.redirectTo}
                            </a>
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => mutate()}>
                        <RefreshCcw /> Refresh
                    </Button>
                </div>
                <div className="flex-1 min-h-0 grid gap-4 grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
                    <div className="col-span-2">
                        <ClicksChart retentionDays={data.metrics.retentionDays} clicks={data.metrics.clicks} uniques={data.metrics.uniques} />
                    </div>
                    <div className="col-span-2">
                        <GeographicDistribution countries={data.metrics.countries.total} />
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                        <TopReferrers referrers={data.metrics.referrers.total} />
                    </div>
                    <DeviceDistribution devices={data.metrics.devices.total} />
                    <OSDistribution operatingSystems={data.metrics.os.total} />
                    <BrowserDistribution browsers={data.metrics.browsers.total} />
                </div>
            </div>
        );
}
