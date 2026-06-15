"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutGrid,
  Users,
  Key,
  BookOpen,
  HelpCircle,
  FileCode2,
  PenTool,
  Zap,
  Lightbulb,
  Trophy,
  Award,
  BarChart2,
  Bell,
  School,
  HeadphonesIcon,
  Globe,
  ShieldCheck,
  ClipboardList,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize collapse state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
    setIsLoaded(true);
  }, []);

  // Persist collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { title: "الرئيسية", icon: LayoutGrid, href: "/dashboard-8ukhba2" },
    { title: "الطلاب", icon: Users, href: "/dashboard-8ukhba2/students" },
    {
      title: "مفاتيح التفعيل والاشتراكات",
      icon: Key,
      href: "/dashboard-8ukhba2/keys",
    },
  ];

  const contentItems = [
    { title: "المناهج", icon: BookOpen, href: "/dashboard-8ukhba2/curricula" },
    {
      title: "الأسئلة",
      icon: HelpCircle,
      href: "/dashboard-8ukhba2/questions",
    },
    {
      title: "استيراد الأسئلة JSON",
      icon: FileCode2,
      href: "/dashboard-8ukhba2/import",
    },
    {
      title: "محرر الأسئلة التفاعلية",
      icon: PenTool,
      href: "/dashboard-8ukhba2/editor",
    },
    {
      title: "التحدي اليومي",
      icon: Zap,
      href: "/dashboard-8ukhba2/daily-challenge",
    },
    { title: "حكمة اليوم", icon: Lightbulb, href: "/dashboard-8ukhba2/wisdom" },
  ];

  const interactionItems = [
    { title: "المنافسة", icon: Trophy, href: "/dashboard-8ukhba2/competition" },
    {
      title: "الأوسمة والجواهر",
      icon: Award,
      href: "/dashboard-8ukhba2/badges",
    },
  ];

  const adminItems = [
    {
      title: "الإحصائيات والتحليلات",
      icon: BarChart2,
      href: "/dashboard-8ukhba2/analytics",
    },
    {
      title: "الإشعارات",
      icon: Bell,
      href: "/dashboard-8ukhba2/notifications",
    },
    { title: "المدارس", icon: School, href: "/dashboard-8ukhba2/schools" },
    {
      title: "الدعم والمشاكل",
      icon: HeadphonesIcon,
      href: "/dashboard-8ukhba2/support",
    },
    { title: "صفحة الهبوط", icon: Globe, href: "/dashboard-8ukhba2/landing" },
    {
      title: "صلاحيات الأدمن",
      icon: ShieldCheck,
      href: "/dashboard-8ukhba2/permissions",
    },
    {
      title: "سجل العمليات",
      icon: ClipboardList,
      href: "/dashboard-8ukhba2/logs",
    },
    { title: "الإعدادات", icon: Settings, href: "/dashboard-8ukhba2/settings" },
  ];

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 p-2 bg-white rounded-md shadow-md text-slate-700"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-[#16192b] text-slate-300 transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen",
          isCollapsed ? "w-20" : "w-70",
          isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-20 border-b border-white/5">
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              isCollapsed && "justify-center w-full",
            )}
          >
            {!isCollapsed && (
              <>
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-600/20">
                  ن
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-white font-bold text-base">
                    النخبة الأوائل
                  </span>
                  <span className="text-slate-500 text-xs">لوحة التحكم</span>
                </div>
              </>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex text-slate-500 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>

          {/* Mobile Close Toggle */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard-8ukhba2");
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Content Section */}
            <div
              className={cn("mt-6 mb-2", isCollapsed ? "text-center" : "px-3")}
            >
              {!isCollapsed && (
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  المحتوى
                </p>
              )}
              {isCollapsed && <div className="h-px w-full bg-white/10 my-4" />}
            </div>
            {contentItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard-8ukhba2");
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon
                    size={18}
                    className="shrink-0 text-slate-400 group-hover:text-white"
                  />
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Interaction Section */}
            <div
              className={cn("mt-6 mb-2", isCollapsed ? "text-center" : "px-3")}
            >
              {!isCollapsed && (
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  التفاعل
                </p>
              )}
              {isCollapsed && <div className="h-px w-full bg-white/10 my-4" />}
            </div>
            {interactionItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard-8ukhba2");
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon
                    size={18}
                    className="shrink-0 text-slate-400 group-hover:text-white"
                  />
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Admin Section */}
            <div
              className={cn("mt-6 mb-2", isCollapsed ? "text-center" : "px-3")}
            >
              {!isCollapsed && (
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  الإدارة
                </p>
              )}
              {isCollapsed && <div className="h-px w-full bg-white/10 my-4" />}
            </div>
            {adminItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard-8ukhba2");
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon
                    size={18}
                    className="flex-shrink-0 text-slate-400 group-hover:text-white"
                  />
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all group hover:bg-red-500/10 text-red-500",
              isCollapsed && "justify-center",
            )}
            title={isCollapsed ? "تسجيل الخروج" : undefined}
            onClick={() => router.push("/adminsLogin-8ukhba2")}
          >
            <LogOut size={20} className="shrink-0 rotate-180" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                تسجيل الخروج
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
