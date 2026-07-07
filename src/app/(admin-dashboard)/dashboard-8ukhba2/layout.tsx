import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard redirectTo="/login" allowedRoles={["admin"]}>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 overflow-hidden flex flex-col h-screen">
          {/* <DashboardHeader /> */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
