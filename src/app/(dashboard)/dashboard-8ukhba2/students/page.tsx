import {
  Plus,
  Search,
  Filter,
  Eye,
  Ban,
  Send,
  Calendar,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data representing the table rows
const students = [
  {
    id: 1,
    name: "أحمد محمد الخطيب",
    email: "ahmed.khateeb@example.com",
    avatar: "أ",
    track: "بكالوريا علمي",
    activation: "مفعل",
    subscription: "مشترك",
    subEnd: "2027-06-01",
    lastLogin: "2026-06-07",
    gems: 450,
    status: "نشط",
  },
  {
    id: 2,
    name: "سارة عبد الرحمن النجار",
    email: "sara.najjar@example.com",
    avatar: "س",
    track: "بكالوريا أدبي",
    activation: "مفعل",
    subscription: "مشترك",
    subEnd: "2027-05-15",
    lastLogin: "2026-06-06",
    gems: 320,
    status: "نشط",
  },
  {
    id: 3,
    name: "محمد يوسف القاسم",
    email: "mohammad.qasem@example.com",
    avatar: "م",
    track: "الصف التاسع",
    activation: "غير مفعل",
    subscription: "غير مشترك",
    subEnd: "—",
    lastLogin: "—",
    gems: 0,
    status: "غير مفعل",
  },
  {
    id: 4,
    name: "ليلى حسن إبراهيم",
    email: "layla.hassan@example.com",
    avatar: "ل",
    track: "بكالوريا علمي",
    activation: "مفعل",
    subscription: "اشتراك منتهي",
    subEnd: "2026-03-01",
    lastLogin: "2026-03-15",
    gems: 180,
    status: "غير نشط",
  },
  {
    id: 5,
    name: "خالد إبراهيم المصري",
    email: "khalid.masri@example.com",
    avatar: "خ",
    track: "الصف التاسع",
    activation: "مفعل",
    subscription: "مشترك",
    subEnd: "2026-12-01",
    lastLogin: "2026-05-01",
    gems: 120,
    status: "محظور",
  },
  {
    id: 6,
    name: "نور الدين علي",
    email: "noor.ali@example.com",
    avatar: "ن",
    track: "بكالوريا علمي",
    activation: "مفعل",
    subscription: "مشترك",
    subEnd: "2027-04-10",
    lastLogin: "2026-06-08",
    gems: 780,
    status: "نشط",
  },
];

// Helper function to render colored badges based on text value
const getBadgeStyles = (text: string) => {
  switch (text) {
    case "مفعل":
    case "نشط":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "مشترك":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "غير مفعل":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "اشتراك منتهي":
    case "محظور":
      return "bg-rose-100 text-rose-600 border-rose-200";
    case "غير مشترك":
    case "غير نشط":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const filterTabs = [
  "الكل",
  "الصف التاسع",
  "بكالوريا علمي",
  "بكالوريا أدبي",
  "مشترك",
  "غير مشترك",
  "اشتراك منتهي",
  "نشط",
  "غير نشط",
  "محظور",
  "غير مفعل",
];

export default function Students() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الطلاب</h1>
          <p className="text-sm text-slate-500 mt-1">6 طالب مسجل في المنصة</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-10">
          <p className="">إضافة طالب</p>
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-2 border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-2/3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
                className="w-full pr-9 focus-visible:ring-blue-600 "
              />
            </div>
            {/* Filter Button */}
            <Button
              variant="outline"
              className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 flex-1"
            >
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {filterTabs.map((tab, index) => (
              <button
                key={tab}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
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

      {/* Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">الطالب</th>
                <th className="px-6 py-4 text-center">المسار</th>
                <th className="px-6 py-4 text-center">التفعيل</th>
                <th className="px-6 py-4 text-center">الاشتراك</th>
                <th className="px-6 py-4 text-center">انتهاء الاشتراك</th>
                <th className="px-6 py-4 text-center">آخر دخول</th>
                <th className="px-6 py-4 text-center">الجواهر</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Student Info */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {student.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {student.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                    {student.track}
                  </td>

                  {/* Activation Badge */}
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles(
                        student.activation,
                      )}`}
                    >
                      {student.activation}
                    </span>
                  </td>

                  {/* Subscription Badge */}
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border  ${getBadgeStyles(
                        student.subscription,
                      )}`}
                    >
                      {student.subscription}
                    </span>
                  </td>

                  {/* Sub End Date */}
                  <td className="px-6 py-3 text-center text-slate-500 whitespace-nowrap">
                    {student.subEnd}
                  </td>

                  {/* Last Login Date */}
                  <td className="px-6 py-3 text-center text-slate-500 whitespace-nowrap">
                    {student.lastLogin}
                  </td>

                  {/* Gems */}
                  <td className="px-6 py-3 text-center font-semibold text-amber-500 whitespace-nowrap">
                    {student.gems}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles(
                        student.status,
                      )}`}
                    >
                      {student.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {student.status === "محظور" ? (
                        <button
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="فك الحظر"
                        >
                          <Unlock className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حظر"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="إرسال رسالة"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="تعديل التواريخ"
                      >
                        <Calendar className="h-4 w-4" />
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
