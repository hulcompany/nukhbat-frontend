import { Plus, Eye, EyeOff, Edit, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Mock Data based on the screenshot
const challengeData = [
  {
    id: 1,
    date: "2026-06-08",
    subject: "فيزياء",
    unit: "النواس",
    lesson: "النواس البسيط",
    track: "بكالوريا علمي",
    questionsCount: 10,
    reward: 3,
    status: "فعال",
    participants: 145,
    successRate: 72,
  },
  {
    id: 2,
    date: "2026-06-07",
    subject: "رياضيات",
    unit: "المشتقات",
    lesson: "قواعد الاشتقاق",
    track: "بكالوريا علمي",
    questionsCount: 8,
    reward: 2,
    status: "فعال",
    participants: 128,
    successRate: 65,
  },
  {
    id: 3,
    date: "2026-06-06",
    subject: "عربي",
    unit: "البلاغة",
    lesson: "المجاز",
    track: "بكالوريا أدبي",
    questionsCount: 10,
    reward: 3,
    status: "فعال",
    participants: 89,
    successRate: 80,
  },
  {
    id: 4,
    date: "2026-06-05",
    subject: "فيزياء",
    unit: "الكهرباء",
    lesson: "قانون أوم",
    track: "الصف التاسع",
    questionsCount: 6,
    reward: 2,
    status: "موقوف",
    participants: 56,
    successRate: 58,
  },
];

// Helper to determine progress bar color
const getProgressColor = (rate: number) => {
  if (rate >= 70) return "bg-emerald-400";
  return "bg-amber-400";
};

export default function DailyChallengePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">التحدي اليومي</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة التحديات اليومية للطلاب
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-11 transition-all shadow-sm shadow-blue-200">
          إضافة تحدي
          <Plus className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-emerald-500 mb-2">3</span>
          <span className="text-sm text-slate-500 font-medium">
            تحديات نشطة
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-600 mb-2">418</span>
          <span className="text-sm text-slate-500 font-medium">
            إجمالي المشاركين
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-amber-500 mb-2">69%</span>
          <span className="text-sm text-slate-500 font-medium">
            متوسط نسبة النجاح
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-purple-600 mb-2">1070</span>
          <span className="text-sm text-slate-500 font-medium">
            إجمالي الجواهر الموزعة
          </span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  التاريخ
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  المادة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الوحدة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الدرس
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  المسار
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الأسئلة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  المكافأة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  الحالة
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  المشاركون
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  نسبة النجاح
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {challengeData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Date */}
                  <td className="px-6 py-4 text-center text-slate-700 font-medium whitespace-nowrap">
                    {row.date}
                  </td>

                  {/* Subject, Unit, Lesson, Track */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.subject}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.unit}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.lesson}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.track}
                  </td>

                  {/* Questions Count */}
                  <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.questionsCount}
                  </td>

                  {/* Reward (Diamond Icon + Number) */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 text-amber-500 font-semibold">
                      <span>{row.reward}</span>
                      <Diamond className="h-4 w-4 fill-amber-500" />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === "فعال"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Participants */}
                  <td className="px-4 py-4 text-center text-slate-700 font-medium whitespace-nowrap">
                    {row.participants}
                  </td>

                  {/* Success Rate Progress Bar */}
                  <td className="px-4 py-4 whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-medium text-xs w-8 text-right">
                        {row.successRate}%
                      </span>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex-row-reverse flex">
                        <div
                          className={`h-full rounded-full ${getProgressColor(row.successRate)}`}
                          style={{ width: `${row.successRate}%` }}
                        ></div>
                      </div>
                    </div>
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
