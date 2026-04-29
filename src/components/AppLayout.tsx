import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useHomeMode } from "@/contexts/HomeModeContext";
import { Home, MoonStar, Footprints } from "lucide-react";

const modeLabels: Record<string, { label: string; icon: any; className: string }> = {
  home: { label: "Home", icon: Home, className: "bg-success/15 text-success border-success/30" },
  away: { label: "Away", icon: Footprints, className: "bg-warning/15 text-warning border-warning/30" },
  night: { label: "Night", icon: MoonStar, className: "bg-primary/15 text-primary border-primary/30" },
};

export default function AppLayout() {
  const { mode } = useHomeMode();
  const current = mode ? modeLabels[mode] : null;
  const Icon = current?.icon;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                Smart Home <span className="text-gradient">Monitor</span>
              </h1>
            </div>
            {current && Icon && (
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-smooth ${current.className}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>Режим: {current.label}</span>
              </div>
            )}
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
