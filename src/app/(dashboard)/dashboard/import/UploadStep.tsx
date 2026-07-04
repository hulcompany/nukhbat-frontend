import { FileJson, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pass a prop to handle moving to the next step
export function UploadStep({ onNext }: { onNext: () => void }) {
  const requiredFields = [
    "question_text",
    "subject",
    "unit",
    "lesson",
    "rule",
    "difficulty",
    "question_type",
    "display_template",
    "options",
    "correct_answer",
    "hint",
    "explanation",
    "tags",
    "media",
    "review_enabled",
    "daily_challenge_enabled",
    "status",
  ];

  return (
    <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-50 hover:border-blue-300">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
        <FileJson className="h-8 w-8 text-blue-600" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        اسحب ملف JSON هنا
      </h3>
      <p className="text-sm text-slate-500 mb-8">
        أو انقر لاختيار ملف · يُقبل فقط ملفات json.
      </p>

      {/* When clicked, trigger the onNext function to update the URL */}
      <Button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 text-base font-medium transition-all shadow-sm shadow-blue-200"
      >
        اختيار ملف JSON
        <Upload className="mr-2 h-5 w-5" />
      </Button>

      {/* Required Fields Info Box */}
      <div className="mt-12 w-full bg-slate-100/80 rounded-2xl p-6 text-right border border-slate-200/60">
        <p className="text-sm font-bold text-slate-800 mb-4">
          حقول JSON المطلوبة:
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          {requiredFields.map((field) => (
            <span
              key={field}
              className="bg-slate-200/70 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight"
              dir="ltr"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
