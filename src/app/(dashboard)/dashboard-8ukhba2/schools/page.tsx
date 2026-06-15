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
  return (
    <div className="p-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة المدارس</h1>
          <p className="text-slate-500">
            إدارة اشتراكات المدارس والعقود المؤسسية
          </p>
        </div>

        <ActionButton
          label="إضافة مدرسة"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-0">
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-2 gap-6">
        {schools.map((school, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{school.name}</h3>
                    <p className="text-sm text-slate-500">
                      {school.students} طالب
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${school.statusColor}`}
                >
                  {school.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "بداية العقد", val: school.contractStart },
                  { label: "نهاية العقد", val: school.contractEnd },
                  { label: "الطلاب", val: `${school.students} طالب` },
                  { label: "المفاتيح", val: `${school.keys} مفتاح` },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-medium">{item.val}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-blue-100 text-blue-700 border-none"
                >
                  <Edit2 size={16} /> تعديل
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-green-100 text-green-700 border-none"
                >
                  <Key size={16} /> إنشاء مفاتيح
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-purple-100 text-purple-700 border-none"
                >
                  <Send size={16} /> إشعار
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 bg-amber-100 text-amber-700 border-none"
                >
                  <FileText size={16} /> تقرير
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
