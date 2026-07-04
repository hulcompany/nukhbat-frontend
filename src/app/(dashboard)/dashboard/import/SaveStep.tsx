import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveStepProps {
  onReset: () => void;
}

export function SaveStep({ onReset }: SaveStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center animate-in fade-in zoom-in duration-500">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2
          className="h-12 w-12 text-emerald-500"
          strokeWidth={2.5}
        />
      </div>

      {/* Success Text */}
      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        تم الحفظ بنجاح!
      </h2>
      <p className="text-slate-500 text-lg mb-8">
        تم حفظ 3 سؤال بنجاح في النظام
      </p>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 text-base font-medium transition-all shadow-sm shadow-blue-200"
      >
        استيراد ملف جديد
      </Button>
    </div>
  );
}
