import { DashboardAuth } from "@/components/dashboard-auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardProjectProvider } from "@/contexts/dashboard-project-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuth>
      <DashboardProjectProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProjectProvider>
    </DashboardAuth>
  );
}
