import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-8 text-blue-600 shadow-sm">
        <FileQuestion size={48} strokeWidth={1.5} />
      </div>

      <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
        404
      </h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        عذراً، الصفحة غير موجودة
      </h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        الصفحة التي تبحث عنها قد تكون حُذفت، تم تغيير عنوانها، أو أنها غير متاحة
        مؤقتاً.
      </p>

      <div className="flex gap-4">
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Link href="/">العودة للصفحة الرئيسية</Link>
        </Button>
      </div>

      <div className="absolute bottom-8 text-slate-400 text-xs font-medium">
        نظام النخبة الأوائل © 2026
      </div>
    </div>
  );
}
