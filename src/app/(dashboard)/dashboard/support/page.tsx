"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stats = [
  { label: "جديد", value: "1", color: "text-blue-600" },
  { label: "قيد المعالجة", value: "1", color: "text-amber-500" },
  { label: "تم الحل", value: "1", color: "text-green-600" },
  { label: "مغلق", value: "1", color: "text-slate-500" },
];

const issues = [
  {
    id: "#tk1",
    student: "ليلى حسن إبراهيم",
    type: "مشكلة في مفتاح التفعيل",
    title: "المفتاح لا يعمل",
    status: "تم الحل",
    date: "2026-02-20",
    lastUpdate: "2026-02-22",
    admin: "فريق الدعم",
  },
  {
    id: "#tk2",
    student: "أحمد محمد الخطيب",
    type: "مشكلة في سؤال",
    title: "إجابة السؤال غير صحيحة",
    status: "قيد المعالجة",
    date: "2026-06-01",
    lastUpdate: "2026-06-05",
    admin: "فريق المحتوى",
  },
  {
    id: "#tk3",
    student: "سارة عبد الرحمن النجار",
    type: "مشكلة تقنية",
    title: "التطبيق يتوقف فجأة",
    status: "جديد",
    date: "2026-06-07",
    lastUpdate: "2026-06-07",
    admin: "—",
  },
  {
    id: "#tk4",
    student: "نور الدين علي",
    type: "اقتراح",
    title: "إضافة وضع مراجعة سريعة",
    status: "مغلق",
    date: "2026-04-15",
    lastUpdate: "2026-04-20",
    admin: "—",
  },
];

export default function SupportPage() {
  const [filter, setFilter] = useState("الكل");

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-xl md:text-2xl font-bold">الدعم والمشاكل</h1>
        <p className="text-sm text-slate-500">إدارة طلبات الدعم من الطلاب</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-0 overflow-hidden">
            <CardContent className="p-4 md:p-6 text-center">
              <div
                className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}
              >
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-slate-500">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-3 md:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 md:h-5 md:w-5" />
          <Input
            type="text"
            placeholder="بحث في الطلبات..."
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm"
          />
        </div>
        <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {["الكل", "جديد", "قيد المعالجة", "تم الحل", "مغلق"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className="rounded-md px-3 md:px-4 py-1.5 md:py-2 h-auto text-xs md:text-sm whitespace-nowrap"
            >
              {f}
            </Button>
          ))}
        </div>
      </Card>

      {/* Issues Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-slate-400 text-xs md:text-sm border-b bg-slate-50/50">
                {[
                  "رقم الطلب",
                  "الطالب",
                  "نوع المشكلة",
                  "العنوان",
                  "الحالة",
                  "تاريخ الإرسال",
                  "آخر تحديث",
                  "المسؤول",
                  "إجراءات",
                ].map((h) => (
                  <th key={h} className="p-4 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-bold text-blue-600 whitespace-nowrap text-sm">
                    {issue.id}
                  </td>
                  <td className="p-4 text-sm whitespace-nowrap">
                    {issue.student}
                  </td>
                  <td className="p-4 text-sm whitespace-nowrap">
                    {issue.type}
                  </td>
                  <td className="p-4 text-sm min-w-[200px]">{issue.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs border whitespace-nowrap font-medium ${issue.status === "تم الحل" ? "bg-green-100 text-green-700 border-green-200" : issue.status === "قيد المعالجة" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs md:text-sm whitespace-nowrap">
                    {issue.date}
                  </td>
                  <td className="p-4 text-slate-500 text-xs md:text-sm whitespace-nowrap">
                    {issue.lastUpdate}
                  </td>
                  <td className="p-4 text-slate-500 text-xs md:text-sm whitespace-nowrap">
                    {issue.admin}
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-100 text-blue-700 border-none rounded-lg hover:bg-blue-200 h-8 px-4 text-xs font-bold"
                    >
                      فتح
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
