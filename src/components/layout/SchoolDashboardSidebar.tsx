"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { FileImage } from "@/components/ui/file-image";
import { getMySchool } from "@/api/schools";
import { getNotificationStats } from "@/api/notifications"; // <-- Imported new API
import { School } from "@/types/school";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutGrid,
  Users,
  Key,
  BookOpen,
  Book,
  HelpCircle,
  Zap,
  Trophy,
  BarChart2,
  Bell,
  HeadphonesIcon,
  Settings,
  LogOut,
  X,
  Building2,
} from "lucide-react";

const BASE = "/dashboard";

const mainItems = [
  { title: "الرئيسية", icon: LayoutGrid, href: BASE },
  { title: "الطلاب", icon: Users, href: `${BASE}/students` },
  { title: "مفاتيح التفعيل", icon: Key, href: `${BASE}/keys` },
];

const contentItems = [
  { title: "المناهج", icon: BookOpen, href: `${BASE}/curricula` },
  { title: "الكتب", icon: Book, href: `${BASE}/books` },
  { title: "الأسئلة", icon: HelpCircle, href: `${BASE}/questions` },
  { title: "التحدي اليومي", icon: Zap, href: `${BASE}/daily-challenge` },
  { title: "المنافسة", icon: Trophy, href: `${BASE}/competition` },
];

const otherItems = [
  { title: "ملف المدرسة", icon: Building2, href: `${BASE}/profile` },
  {
    title: "الإشعارات",
    icon: Bell,
    href: `${BASE}/notifications`,
    showBadge: true,
  }, // <-- Added showBadge flag
  { title: "الإعدادات", icon: Settings, href: `${BASE}/settings` },
];

const sections = [
  { label: null, items: mainItems },
  { label: "المحتوى", items: contentItems },
  { label: "أخرى", items: otherItems },
];

function roleLabel(role?: string) {
  if (role === "admin") return "مسؤول";
  if (role === "contentWriter") return "كاتب محتوى";
  return role ?? "";
}

export function SchoolDashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0); // <-- Added state for unread count

  useEffect(() => {
    const saved = localStorage.getItem("schoolSidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.role !== "contentWriter") return;

    const fetchSchool = () => {
      getMySchool()
        .then((res) => setSchool(res.data))
        .catch(() => setSchool(null));
    };

    // <-- Fetch Notification Stats
    const fetchStats = () => {
      getNotificationStats()
        .then((res) => setUnreadCount(res.data.unRead))
        .catch(() => setUnreadCount(0));
    };

    fetchSchool();
    fetchStats(); // <-- Called fetch stats

    // Re-fetch when the profile page updates the school (e.g. new logo)
    window.addEventListener("school-updated", fetchSchool);
    return () => window.removeEventListener("school-updated", fetchSchool);
  }, [user?.role]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("schoolSidebarCollapsed", String(next));
  };

  function NavLink({
    href,
    icon: Icon,
    title,
    size = 18,
    showBadge = false, // <-- Added showBadge prop
  }: {
    href: string;
    icon: React.ElementType;
    title: string;
    size?: number;
    showBadge?: boolean;
  }) {
    const isActive = pathname === href || (href === BASE && pathname === BASE);
    return (
      <Link
        href={href}
        title={isCollapsed ? title : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative", // <-- Added relative positioning
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "hover:bg-white/5 hover:text-white",
          isCollapsed && "justify-center",
        )}
      >
        <div className="relative">
          <Icon
            size={size}
            className={cn(
              "shrink-0",
              isActive ? "text-white" : "text-slate-400 group-hover:text-white",
            )}
          />
          {/* Collapsed Badge indicator (just a dot) */}
          {showBadge && unreadCount > 0 && isCollapsed && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#16192b]"></span>
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-medium whitespace-nowrap">
              {title}
            </span>
            {/* Expanded Badge indicator (shows number) */}
            {showBadge && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? "+99" : unreadCount}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  }

  if (!isLoaded) return null;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-[18px] right-4 z-40 p-2 bg-white rounded-lg shadow-md text-slate-700 border border-slate-100"
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

      {/* Sidebar */}
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
                <img
                  src="/images/logo.webp"
                  alt="شعار النُخبة"
                  className="shrink-0 w-10 h-10 object-contain rounded-lg shadow-lg shadow-blue-600/20"
                />
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-white font-bold text-base">
                    النُخبة
                  </span>
                  <span className="text-slate-500 text-xs">لوحة المدرسة</span>
                </div>
              </>
            )}
          </div>
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
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10">
          <nav className="space-y-1 px-3">
            {sections.map((section, si) => (
              <div key={si}>
                {si > 0 && (
                  <div
                    className={cn(
                      "mt-6 mb-2",
                      isCollapsed ? "text-center" : "px-3",
                    )}
                  >
                    {!isCollapsed ? (
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        {section.label}
                      </p>
                    ) : (
                      <div className="h-px w-full bg-white/10 my-4" />
                    )}
                  </div>
                )}
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    // Tell TS that item might have an optional showBadge boolean
                    showBadge={(item as { showBadge?: boolean }).showBadge}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Info + Logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {user && (
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2",
                isCollapsed && "justify-center px-0",
              )}
              title={isCollapsed ? user.name : undefined}
            >
              {school?.logo ? (
                <FileImage
                  fileId={school.logo}
                  alt={school.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : user.profileImage ? (
                <FileImage
                  fileId={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white text-sm font-semibold truncate">
                    {user.name}
                  </span>
                  <span className="text-slate-500 text-xs truncate">
                    {roleLabel(user.role)}
                  </span>
                </div>
              )}
            </div>
          )}
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all group hover:bg-red-500/10 text-red-500",
              isCollapsed && "justify-center",
            )}
            title={isCollapsed ? "تسجيل الخروج" : undefined}
            onClick={() => {
              logout();
              router.push("/login");
            }}
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
