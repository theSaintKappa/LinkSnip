import { ThemeProvider } from "@public/components/theme-provider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsView } from "./analytics-view";

import "@public/globals.css";

createRoot(document.body).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <main className="flex justify-center items-center p-4 h-screen supports-[height:100dvh]:h-dvh">
                <AnalyticsView />
            </main>
        </ThemeProvider>
    </StrictMode>,
);
