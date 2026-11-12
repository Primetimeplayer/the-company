"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar, MobileNav, type Counts } from "./app-sidebar";
import { DashboardView, type DashboardViewProps } from "./dashboard-view";
import { FooterDisclaimer } from "@/components/footer-disclaimer";

export interface DashboardShellProps {
  counts: Counts;
  header: ReactNode;
  dashboard: Omit<DashboardViewProps, "loaded" | "onSampleLoaded">;
}

/**
 * Owns the "sample project loaded" state so the sidebar and mobile nav can show
 * placeholder counts until the checks have actually been run.
 */
export function DashboardShell({ counts, header, dashboard }: DashboardShellProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[1560px]">
      <AppSidebar counts={loaded ? counts : null} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav counts={loaded ? counts : null} />

        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {header}
          <DashboardView
            {...dashboard}
            loaded={loaded}
            onSampleLoaded={() => setLoaded(true)}
          />
        </main>

        <FooterDisclaimer />
      </div>
    </div>
  );
}
