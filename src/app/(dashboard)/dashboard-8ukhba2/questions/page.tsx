"use client";

import { useState } from "react";
import { Search, Plus, Eye, EyeOff, Edit, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data representing the questions table rows
const questionsData = [
  {
    id: 1,
    text: "إذا كانت سعة مكثف 10 µF = C وفرق الجهد 12V = V، ما مقدار",
    subject: "فيزياء",
    unit: "الكهرباء",
    type: "اختيار متعدد",
    difficulty: "متوسط",
    status: "فعال",
    solutions: 340,
    errors: 85,
    hasChallenge: true,
  },
  {
    id: 2,
    text: "يتأرجح النواس البسيط بزاوية صغيرة، هل دوره التذبذب يعتمد على السعة؟",
    subject: "فيزياء",
    unit: "النواس",
    type: "صح وخطأ",
    difficulty: "سهل",
    status: "فعال",
    solutions: 520,
    errors: 120,
    hasChallenge: false,
  },
  {
    id: 3,
    text: "رتب خطوات الحل الصحيح لمعادلة التفاضل الخاصة بالنواس:",
    subject: "فيزياء",
    unit: "النواس",
    type: "ترتيب خطوات",
    difficulty: "صعب",
    status: "فعال",
    solutions: 180,
    errors: 95,
    hasChallenge: false,
  },
  {
    id: 4,
    text: 'اكتشف الخطأ في الجملة التالية: "يتناسب دور النواس عكسياً مع طول الخيط"',
    subject: "فيزياء",
    unit: "النواس",
    type: "اكتشف الخطأ",
    difficulty: "متوسط",
    status: "فعال",
    solutions: 290,
    errors: 110,
    hasChallenge: true,
  },
  {
    id: 5,
    text: "صل بين كل قانون والمقدار الفيزيائي المناسب:",
    subject: "فيزياء",
    unit: "الكهرباء",
    type: "توصيل",
    difficulty: "متوسط",
    status: "يحتاج مراجعة",
    solutions: 0,
    errors: 0,
    hasChallenge: false,
  },
  {
    id: 6,
    text: "أكمل القانون: I = V × _ _ _",
    subject: "فيزياء",
    unit: "الكهرباء",
    type: "فراغات",
    difficulty: "سهل",
    status: "فعال",
    solutions: 680,
    errors: 45,
    hasChallenge: true,
  },
  {
    id: 7,
    text: "حول الوحدات: 3600 ثانية = _ _ _ ساعة",
    subject: "فيزياء",
    unit: "القياس",
    type: "تحويل وحدات",
    difficulty: "سهل",
    status: "فعال",
    solutions: 450,
    errors: 30,
    hasChallenge: false,
  },
  {
    id: 8,
    text: "حل المعادلة التفاضلية للنواس خطوة بخطوة موضحاً جميع القوانين المستخدمة:",
    subject: "فيزياء",
    unit: "النواس",
    type: "خطوة بخطوة",
    difficulty: "صعب",
    status: "مخفي",
    solutions: 0,
    errors: 0,
    hasChallenge: false,
  },
];

// Helper for Difficulty Badges
const getDifficultyStyles = (level: string) => {
  switch (level) {
    case "سهل":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "متوسط":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "صعب":
      return "bg-rose-100 text-rose-600 border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

// Helper for Status Badges
const getStatusStyles = (status: string) => {
  switch (status) {
    case "فعال":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "يحتاج مراجعة":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "مخفي":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function Questions() {
  const [selectedText, setSelectedText] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الأسئلة</h1>
          <p className="text-sm text-slate-500 mt-1">8 سؤال في النظام</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-10">
          إضافة سؤال
          <Plus className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-emerald-500 mb-1">6</span>
          <span className="text-sm text-slate-500">فعال</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-slate-400 mb-1">1</span>
          <span className="text-sm text-slate-500">مخفي</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-amber-500 mb-1">1</span>
          <span className="text-sm text-slate-500">يحتاج مراجعة</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-600 mb-1">3</span>
          <span className="text-sm text-slate-500">في التحدي اليومي</span>
        </Card>
      </div>

      {/* Search Input Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="بحث في نص السؤال..."
              className="w-full pr-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Data Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-1/3">نص السؤال</th>
                <th className="px-4 py-4 text-center">المادة</th>
                <th className="px-4 py-4 text-center">الوحدة</th>
                <th className="px-4 py-4 text-center">نوع السؤال</th>
                <th className="px-4 py-4 text-center">الصعوبة</th>
                <th className="px-4 py-4 text-center">الحالة</th>
                <th className="px-4 py-4 text-center">الحلول</th>
                <th className="px-4 py-4 text-center">الأخطاء</th>
                <th className="px-4 py-4 text-center">التحدي</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {questionsData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Clickable Question Text */}
                  <td
                    onClick={() => setSelectedText(row.text)}
                    title="انقر لتوسيع النص"
                    className="px-6 py-4 text-slate-800 font-medium cursor-pointer hover:text-blue-600 transition-colors truncate max-w-75"
                  >
                    {row.text}
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.subject}
                  </td>

                  {/* Unit */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.unit}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.type}
                  </td>

                  {/* Difficulty Badge */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyStyles(
                        row.difficulty,
                      )}`}
                    >
                      {row.difficulty}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(
                        row.status,
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Solutions Count */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.solutions}
                  </td>

                  {/* Errors Count (Red text) */}
                  <td className="px-4 py-4 text-center font-medium text-rose-500 whitespace-nowrap">
                    {row.errors}
                  </td>

                  {/* Challenge Lightning Icon */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {row.hasChallenge ? (
                      <div className="flex justify-center">
                        <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="إخفاء/إظهار"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                      <button
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
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

      {/* Full Text Modal */}
      {selectedText && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedText(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative border border-slate-100"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setSelectedText(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"
              title="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pr-3 border-r-4 border-blue-600">
              نص السؤال كاملاً
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
