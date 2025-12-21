import { App } from "@public/App";
import { ThemeDropdown } from "@public/components/theme-dropdown";
import { ThemeProvider } from "@public/components/theme-provider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@public/globals.css";

createRoot(document.body).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <App />
            <div className="fixed top-0 right-0 p-4">
                <ThemeDropdown />
            </div>
            <footer className="fixed bottom-0 w-full p-4 space-x-2 text-sm text-muted-foreground text-center">
                <a className="hover:text-primary hover:underline underline-offset-4" href="https://github.com/theSaintKappa/LinkSnip" target="_blank" rel="noopener noreferrer">
                    Repo
                </a>
                <span>&bull;</span>
                <a className="hover:text-primary hover:underline underline-offset-4" href="/openapi" target="_blank" rel="noopener noreferrer">
                    API Docs
                </a>
            </footer>
        </ThemeProvider>
    </StrictMode>,
);
