import {
  Download,
  Save,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Mock data based on the screenshot
const validationData = [
  {
    id: 1,
    text: "ما هو قانون نيوتن الثاني؟",
    subject: "فيزياء",
    unit: "القوى",
    type: "mcq",
    status: "صالح للحفظ",
    note: "—",
  },
  {
    id: 2,
    text: "احسب تسارع جسم كتلته 5kg تؤثر عليه قوة 20N",
    subject: "فيزياء",
    unit: "القوى",
    type: "mcq",
    status: "صالح للحفظ",
    note: "—",
  },
  {
    id: 3,
    text: "الطاقة الحركية تساوي ...",
    subject: "فيزياء",
    unit: "الطاقة",
    type: "fill_blanks",
    status: "ناقص بيانات",
    note: "حقل الدرس فارغ",
  },
  {
    id: 4,
    text: "صل بين المصطلحات",
    subject: "فيزياء",
    unit: "القوى",
    type: "matching",
    status: "يحتاج مراجعة",
    note: "يحتاج مراجعة الخيارات",
  },
  {
    id: 5,
    text: "اكتشف الخطأ في التعريف",
    subject: "فيزياء",
    unit: "الحرارة",
    type: "detect_error",
    status: "صالح للحفظ",
    note: "—",
  },
  {
    id: 6,
    text: "video_question_type_1",
    subject: "فيزياء",
    unit: "الموجات",
    type: "video_question",
    status: "نوع غير مدعوم",
    note: "نوع السؤال غير مدعوم",
  },
  {
    id: 7,
    text: "ما هو قانون نيوتن الثاني؟",
    subject: "فيزياء",
    unit: "القوى",
    type: "mcq",
    status: "مكرر",
    note: "يبدو مكرراً مع سؤال موجود",
  },
];

// Helper to render the correct badge style and icon
const getStatusConfig = (status: string) => {
  switch (status) {
    case "صالح للحفظ":
      return {
        badge: "bg-emerald-100 text-emerald-700",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      };
    case "ناقص بيانات":
    case "يحتاج مراجعة":
      return {
        badge: "bg-amber-100 text-amber-700",
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      };
    case "نوع غير مدعوم":
      return {
        badge: "bg-rose-100 text-rose-700",
        icon: <XCircle className="h-4 w-4 text-rose-500" />,
      };
    case "مكرر":
      return {
        badge: "bg-slate-200 text-slate-700",
        icon: <Info className="h-4 w-4 text-slate-500" />,
      };
    default:
      return { badge: "bg-slate-100 text-slate-600", icon: null };
  }
};

interface VerifyStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function VerifyStep({ onNext, onPrev }: VerifyStepProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-600 mb-1">7</span>
          <span className="text-sm text-slate-500 font-medium">الكلي</span>
        </Card>
        <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-emerald-500 mb-1">3</span>
          <span className="text-sm text-slate-500 font-medium">صالح للحفظ</span>
        </Card>
        <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-amber-500 mb-1">1</span>
          <span className="text-sm text-slate-500 font-medium">
            يحتاج مراجعة
          </span>
        </Card>
        <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-amber-500 mb-1">1</span>
          <span className="text-sm text-slate-500 font-medium">
            ناقص بيانات
          </span>
        </Card>
        <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-rose-500 mb-1">2</span>
          <span className="text-sm text-slate-500 font-medium">
            غير مدعوم/مكرر
          </span>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center gap-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-slate-500 hover:text-slate-700"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للملف
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700"
          >
            <Download className="ml-2 h-4 w-4" />
            تصدير تقرير الأخطاء
          </Button>
          {/* Proceed Button */}
          <Button
            onClick={onNext}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-200"
          >
            <Save className="ml-2 h-4 w-4" />
            حفظ الأسئلة الصالحة (3)
          </Button>
        </div>
      </div>

      {/* Verification Data Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">نص السؤال</th>
                <th className="px-4 py-4 text-center">المادة</th>
                <th className="px-4 py-4 text-center">الوحدة</th>
                <th className="px-4 py-4 text-center">النوع</th>
                <th className="px-4 py-4 text-center">الحالة</th>
                <th className="px-4 py-4 text-center">الملاحظات</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {validationData.map((row) => {
                const { badge, icon } = getStatusConfig(row.status);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-slate-500">
                      {row.id}
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-medium truncate max-w-[250px]">
                      {row.text}
                    </td>

                    <td className="px-4 py-4 text-center text-slate-600">
                      {row.subject}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600">
                      {row.unit}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600">
                      {row.type}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Notes with Icon */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {icon}
                        <span
                          className={`text-xs font-medium ${row.note !== "—" ? "text-slate-700" : "text-slate-400"}`}
                        >
                          {row.note}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
