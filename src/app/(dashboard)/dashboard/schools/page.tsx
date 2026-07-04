"use client";

import React from "react";
import { Plus, Edit2, Key, Send, FileText, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";

const stats = [
  { label: "إجمالي المفاتيح", value: "255", color: "purple" },
  { label: "إجمالي الطلاب", value: "215", color: "blue" },
  { label: "عقود منتهية", value: "1", color: "red" },
  { label: "مدارس فعالة", value: "2", color: "green" },
];

const schools = [
  {
    name: "ثانوية النجاح",
    students: 80,
    contractStart: "2025-10-01",
    contractEnd: "2026-07-31",
    keys: 100,
    status: "فعال",
    statusColor: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "مدرسة الأمل الخاصة",
    students: 45,
    contractStart: "2025-09-01",
    contractEnd: "2026-06-30",
    keys: 50,
    status: "فعال",
    statusColor: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "ثانوية الفرات",
    students: 60,
    contractStart: "2026-09-01",
    contractEnd: "2027-06-30",
    keys: 70,
    status: "معلق",
    statusColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    name: "مدرسة العلوم التطبيقية",
    students: 30,
    contractStart: "2024-09-01",
    contractEnd: "2025-06-30",
    keys: 35,
    status: "منتهي",
    statusColor: "bg-red-100 text-red-700 border-red-200",
  },
];

export default function SchoolsManagementPage() {
  const colorMap: Record<string, string> = {
    purple: "text-purple-600",
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
  };

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">إدارة المدارس</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة اشتراكات المدارس والعقود المؤسسية
          </p>
        </div>

        <ActionButton
          label="إضافة مدرسة"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full sm:w-auto"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className={`text-2xl md:text-3xl font-bold ${colorMap[stat.color]} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-slate-500 whitespace-nowrap">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schools.map((school, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 md:gap-4 items-center">
                  <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <Building2 className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg leading-tight">{school.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                      {school.students} طالب
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs border whitespace-nowrap ${school.statusColor}`}
                >
                  {school.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                {[
                  { label: "بداية العقد", val: school.contractStart },
                  { label: "نهاية العقد", val: school.contractEnd },
                  { label: "الطلاب", val: `${school.students} طالب` },
                  { label: "المفاتيح", val: `${school.keys} مفتاح` },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-2 md:p-3 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-400 mb-0.5 md:mb-1">
                      {item.label}
                    </div>
                    <div className="text-xs md:text-sm font-semibold">{item.val}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-blue-100 text-blue-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-blue-200"
                >
                  <Edit2 size={16} className="shrink-0" /> <span className="hidden sm:inline">تعديل</span><span className="sm:hidden">تعديل</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-green-100 text-green-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-green-200"
                >
                  <Key size={16} className="shrink-0" /> <span className="hidden sm:inline">مفاتيح</span><span className="sm:hidden">مفاتيح</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-purple-100 text-purple-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-purple-200"
                >
                  <Send size={16} className="shrink-0" /> <span className="hidden sm:inline">إشعار</span><span className="sm:hidden">إشعار</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-amber-100 text-amber-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-amber-200"
                >
                  <FileText size={16} className="shrink-0" /> <span className="hidden sm:inline">تقرير</span><span className="sm:hidden">تقرير</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
