"use client";

import React from "react";
import { Download, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";

const activityLogs = [
  {
    admin: "المدير العام",
    role: "Super Admin",
    operation: "حظر طالب",
    section: "الطلاب",
    target: "خالد إبراهيم المصري",
    timestamp: "2026-05-01 14:30",
    details: "تم حظر الحساب بسبب انتهاك شروط الاستخدام",
  },
  {
    admin: "مدير الاشتراكات",
    role: "Subscription Manager",
    operation: "إنشاء مفاتيح",
    section: "مفاتيح التفعيل",
    target: "10 مفاتيح - بكالوريا علمي",
    timestamp: "2026-05-15 10:00",
    details: "إنشاء دفعة من 10 مفاتيح للمسار العلمي لمدة سنة",
  },
];

export default function ActivityLogPage() {
  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">سجل العمليات</h1>
          <p className="text-sm text-slate-500 mt-1">
            تتبع جميع العمليات التي يقوم بها المدراء
          </p>
        </div>

        <ActionButton
          label="تصدير السجل"
          icon={Download}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full sm:w-auto"
        />
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 md:h-5 md:w-5" />
        <Input
          type="text"
          placeholder="بحث في السجل.."
          className="w-full pr-10 pl-4 py-2 text-xs md:text-sm"
        />
      </div>

      {/* Log Table */}
      <Card className="overflow-hidden p-0 border-slate-200 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="text-slate-500 text-xs md:text-sm border-b bg-slate-50/80">
                {[
                  "الأدمن",
                  "الدور",
                  "العملية",
                  "القسم",
                  "العنصر المتأثر",
                  "التاريخ والوقت",
                  "تفاصيل",
                ].map((h) => (
                  <th key={h} className="p-4 font-bold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-bold text-slate-800 text-sm whitespace-nowrap">{log.admin}</td>
                  <td className="p-4 text-xs md:text-sm text-slate-500 whitespace-nowrap">{log.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                        log.operation === "حظر طالب"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {log.operation}
                    </span>
                  </td>
                  <td className="p-4 text-xs md:text-sm text-slate-600 whitespace-nowrap">{log.section}</td>
                  <td className="p-4 text-xs md:text-sm text-slate-600 whitespace-nowrap">{log.target}</td>
                  <td className="p-4 text-xs md:text-sm text-slate-500 font-medium" dir="ltr">
                    {log.timestamp}
                  </td>
                  <td className="p-4 text-xs md:text-sm text-slate-600 min-w-[200px] leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Table Footer */}
        <div className="p-4 text-center text-xs md:text-sm text-slate-400 border-t bg-white">
          عرض {activityLogs.length} من {activityLogs.length} سجل
        </div>
      </Card>
    </div>
  );
}
