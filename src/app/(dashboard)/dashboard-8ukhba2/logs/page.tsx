"use client";

import React from "react";
import { Download, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h1 className="text-2xl font-bold">سجل العمليات</h1>
          <p className="text-slate-500">
            تتبع جميع العمليات التي يقوم بها المدراء
          </p>
        </div>

        <ActionButton
          label="تصدير السجل"
          icon={Download}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        />
      </div>

      {/* Search Bar */}

      <div className="relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="بحث في السجل.."
          className="w-full pr-10 pl-4 py-2 text-sm"
        />
      </div>

      {/* Log Table */}
      <Card className="overflow-hidden p-0">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm border-b bg-slate-50">
              {[
                "الأدمن",
                "الدور",
                "العملية",
                "القسم",
                "العنصر المتأثر",
                "التاريخ والوقت",
                "تفاصيل",
              ].map((h) => (
                <th key={h} className="p-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log, idx) => (
              <tr
                key={idx}
                className="border-b last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className="p-4 font-bold">{log.admin}</td>
                <td className="p-4 text-sm text-slate-500">{log.role}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                      log.operation === "حظر طالب"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {log.operation}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{log.section}</td>
                <td className="p-4 text-sm text-slate-600">{log.target}</td>
                <td className="p-4 text-sm text-slate-500" dir="ltr">
                  {log.timestamp}
                </td>
                <td className="p-4 text-sm text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Table Footer */}
        <div className="p-4 text-center text-sm text-slate-400  border-t">
          عرض 2 من 2 سجل
        </div>
      </Card>
    </div>
  );
}
