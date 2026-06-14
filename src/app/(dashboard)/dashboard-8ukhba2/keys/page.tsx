import { Search, Plus, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data for the table
const keysData = [
  {
    id: "ELITE-2025-A1B2",
    track: "بكالوريا علمي",
    duration: "سنة",
    createDate: "2025-08-01",
    endDate: "2027-06-01",
    status: "مستخدم",
    student: "أحمد محمد الخطيب",
    school: "—",
    creator: "المدير",
  },
  {
    id: "ELITE-2025-C3D4",
    track: "بكالوريا أدبي",
    duration: "سنة",
    createDate: "2025-09-01",
    endDate: "2027-05-15",
    status: "مستخدم",
    student: "سارة عبد الرحمن النجار",
    school: "—",
    creator: "المدير",
  },
  {
    id: "ELITE-2025-E5F6",
    track: "بكالوريا علمي",
    duration: "6 أشهر",
    createDate: "2025-08-01",
    endDate: "2026-03-01",
    status: "اشتراك منتهي",
    student: "ليلى حسن إبراهيم",
    school: "—",
    creator: "المدير",
  },
  {
    id: "ELITE-2025-A1B2-2",
    track: "الصف التاسع",
    duration: "شهر",
    createDate: "2026-01-01",
    endDate: "—",
    status: "غير مستخدم",
    student: "—",
    school: "—",
    creator: "مدير الاشتراكات",
  },
  {
    id: "ELITE-2025-C3D4-2",
    track: "بكالوريا علمي",
    duration: "3 أشهر",
    createDate: "2026-02-01",
    endDate: "—",
    status: "غير مستخدم",
    student: "—",
    school: "—",
    creator: "مدير الاشتراكات",
  },
  {
    id: "ELITE-2025-E5F6-2",
    track: "كل المسارات",
    duration: "سنة",
    createDate: "2026-03-01",
    endDate: "—",
    status: "مخصص لمدرسة",
    student: "—",
    school: "مدرسة الأمل",
    creator: "المدير",
  },
  {
    id: "ELITE-2025-C3D4-3",
    track: "بكالوريا أدبي",
    duration: "6 أشهر",
    createDate: "2026-04-01",
    endDate: "—",
    status: "ملغى",
    student: "—",
    school: "—",
    creator: "مدير الاشتراكات",
  },
  {
    id: "ELITE-2025-C3D4-4",
    track: "بكالوريا علمي",
    duration: "سنة",
    createDate: "2025-06-01",
    endDate: "2027-04-10",
    status: "مستخدم",
    student: "نور الدين علي",
    school: "—",
    creator: "المدير",
  },
];

// Helper to style the status badges
const getStatusStyles = (status: string) => {
  switch (status) {
    case "مستخدم":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "غير مستخدم":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "اشتراك منتهي":
      return "bg-rose-100 text-rose-600 border-rose-200";
    case "مخصص لمدرسة":
      return "bg-purple-100 text-purple-600 border-purple-200";
    case "ملغى":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const filterTabs = ["الكل", "غير مستخدم", "مستخدم", "منتهي", "ملغى", "مدرسي"];

export default function Keys() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            مفاتيح التفعيل والاشتراكات
          </h1>
          <p className="text-sm text-slate-500 mt-1">8 مفتاح في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10">
            تصدير Excel
            <Download className="ml-2 h-4 w-4" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
            إنشاء مفاتيح
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-emerald-500 mb-1">2</span>
          <span className="text-sm text-slate-500">غير مستخدمة</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-600 mb-1">3</span>
          <span className="text-sm text-slate-500">مستخدمة</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-rose-500 mb-1">1</span>
          <span className="text-sm text-slate-500">منتهية</span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-slate-600 mb-1">1</span>
          <span className="text-sm text-slate-500">ملغاة</span>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="بحث برمز المفتاح أو اسم الطالب..."
              className="w-full pr-9 focus-visible:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap justify-start gap-2 pt-2 border-t border-slate-100">
            {filterTabs.map((tab, index) => (
              <button
                key={tab}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                  index === 0
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">رمز المفتاح</th>
                <th className="px-6 py-4 text-center">المسار</th>
                <th className="px-6 py-4 text-center">المدة</th>
                <th className="px-6 py-4 text-center">تاريخ الإنشاء</th>
                <th className="px-6 py-4 text-center">تاريخ الانتهاء</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-center">الطالب</th>
                <th className="px-6 py-4 text-center">المدرسة</th>
                <th className="px-6 py-4 text-center">المنشئ</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {keysData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Key Code */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700 bg-gray-100 p-1 rounded-sm">
                        {row.id}
                      </span>
                      <button className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.track}
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.duration}
                  </td>

                  {/* Creation Date */}
                  <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                    {row.createDate}
                  </td>

                  {/* End Date */}
                  <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                    {row.endDate}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(
                        row.status,
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Student */}
                  <td className="px-6 py-4 text-center text-slate-700 whitespace-nowrap">
                    {row.student}
                  </td>

                  {/* School */}
                  <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.school}
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                    {row.creator}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors">
                        تمديد
                      </button>
                      <button className="text-rose-500 hover:text-rose-700 text-xs font-semibold transition-colors">
                        إلغاء
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
