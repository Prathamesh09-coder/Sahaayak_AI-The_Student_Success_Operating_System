import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar, MobileNav } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { VoiceAssistant } from "@/components/app/voice-assistant";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-3 mt-4 pb-28 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
      <VoiceAssistant />
    </div>
  );
}
