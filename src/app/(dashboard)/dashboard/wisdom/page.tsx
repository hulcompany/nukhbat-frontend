"use client";
import { Plus, Upload, Lightbulb, Eye, EyeOff, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";

// Mock Data based on the screenshot
const wisdomData = [
  {
    dayNumber: 1,
    date: "2026-01-01",
    text: '"العلم نور والجهل ظلام"',
    author: "مثل عربي",
    status: "فعال",
  },
  {
    dayNumber: 2,
    date: "2026-01-02",
    text: '"من جدّ وجد، ومن زرع حصد"',
    author: "مثل عربي",
    status: "فعال",
  },
  {
    dayNumber: 3,
    date: "2026-01-03",
    text: '"اطلب العلم من المهد إلى اللحد"',
    author: "—",
    status: "فعال",
  },
  {
    dayNumber: 4,
    date: "2026-01-04",
    text: '"خير الناس أنفعهم للناس"',
    author: "حديث نبوي",
    status: "فعال",
  },
  {
    dayNumber: 5,
    date: "2026-01-05",
    text: '"الوقت كالسيف إن لم تقطعه قطعك"',
    author: "مثل عربي",
    status: "موقوف",
  },
];

export default function WisdomPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">حكمة اليوم</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الحكم اليومية المعروضة للطلاب
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton
            label="رفع Excel (365 حكمة)"
            icon={Upload}
            bgClassName="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 "
          />
          <ActionButton
            label="إضافة حكمة"
            icon={Plus}
            bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#fff9db] border border-[#f1e5a1] rounded-xl p-4 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-amber-500 fill-amber-100" />
        <p className="text-sm font-medium text-amber-800">
          يمكنك رفع ملف Excel يحتوي على 365 حكمة بأعمدة: رقم اليوم، التاريخ، نص
          الحكمة، الكاتب، الحالة
        </p>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  رقم اليوم
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  التاريخ
                </th>
                <th className="px-6 py-4 whitespace-nowrap">نص الحكمة</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  الكاتب
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  الحالة
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {wisdomData.map((row) => (
                <tr
                  key={row.dayNumber}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Day Number */}
                  <td className="px-6 py-4 text-center font-bold text-blue-600 whitespace-nowrap">
                    {row.dayNumber}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                    {row.date}
                  </td>

                  {/* Wisdom Text */}
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {row.text}
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.author}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border ${
                        row.status === "فعال"
                          ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      {row.status === "فعال" ? (
                        <button
                          className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                          title="إخفاء"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="text-emerald-500 hover:text-emerald-600 p-1 transition-colors"
                          title="إظهار"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
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
