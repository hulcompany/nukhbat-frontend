import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
}

/** Centered error state with an optional retry button. */
function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">حدث خطأ ما</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
        {message || "تعذر تحميل البيانات، يرجى المحاولة مرة أخرى"}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
