// src/components/layout/DashboardHeader.tsx
import { Bell, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white z-10 shrink-0 border-b">
      {/* Right Side: Global Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="بحث في لوحة التحكم..."
            className="w-full pr-10 pl-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Left Side: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6 mr-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="h-6 w-6" />
          {/* Notification Badge */}
          <span className="absolute top-1 right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#e15b64] text-[10px] font-bold text-white ring-2 ring-[#f8f9fa]">
            2
          </span>
        </button>

        {/* User Profile Trigger */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 p-1.5 rounded-xl transition-colors">
          {/* Avatar */}
          <div className="h-11 w-11 rounded-full bg-[#1e1e2d] flex items-center justify-center text-white font-bold shadow-sm">
            ا
          </div>

          {/* User Info (Hidden on very small screens) */}
          <div className="hidden sm:flex flex-col items-start justify-center gap-1">
            <span className="text-sm font-bold text-slate-900 leading-none">
              المدير العام
            </span>
            <span className="bg-blue-600 text-white text-[10px] font-medium px-2 py-0.5 rounded leading-none w-fit">
              Super Admin
            </span>
          </div>

          {/* Dropdown Chevron */}
          <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block mr-1" />
        </div>
      </div>
    </header>
  );
}
