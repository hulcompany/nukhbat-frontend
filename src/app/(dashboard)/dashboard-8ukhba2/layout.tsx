// src/app/layout.tsx (or wherever your DashboardLayout is defined)
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Responsive Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col h-screen">
        {/* Top Header */}
        <DashboardHeader />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
