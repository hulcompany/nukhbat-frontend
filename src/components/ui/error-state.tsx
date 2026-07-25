import {
  AlertCircle,
  AlertTriangle,
  FileQuestion,
  Lock,
  ServerCrash,
  ShieldAlert,
  RotateCcw,
  TimerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
  /** HTTP status code, when known — used to pick an icon/title and shown to the user. */
  status?: number | null;
}

interface ErrorConfig {
  icon: typeof AlertCircle;
  iconBg: string;
  iconColor: string;
  title: string;
  message: string;
}

const ERROR_CONFIG: Record<number, ErrorConfig> = {
  400: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "طلب غير صالح",
    message: "البيانات المرسلة غير صحيحة",
  },
  401: {
    icon: Lock,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "يجب تسجيل الدخول",
    message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً",
  },
  403: {
    icon: ShieldAlert,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "غير مصرح لك",
    message: "ليس لديك صلاحية للوصول إلى هذا المورد",
  },
  404: {
    icon: FileQuestion,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "غير موجود",
    message: "لم يتم العثور على البيانات المطلوبة",
  },
  408: {
    icon: TimerOff,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "انتهت مهلة الطلب",
    message: "استغرق الطلب وقتاً طويلاً، يرجى المحاولة مرة أخرى",
  },
  409: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "تعارض في البيانات",
    message: "هذا العنصر موجود مسبقاً أو يتعارض مع بيانات أخرى",
  },
  422: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "تعذّرت معالجة الطلب",
    message: "يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى",
  },
  429: {
    icon: TimerOff,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "طلبات كثيرة جداً",
    message: "يرجى الانتظار قليلاً قبل المحاولة مرة أخرى",
  },
  500: {
    icon: ServerCrash,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "خطأ في الخادم",
    message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً",
  },
  502: {
    icon: ServerCrash,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "خطأ في الخادم",
    message: "الخادم غير قادر على معالجة الطلب حالياً",
  },
  503: {
    icon: ServerCrash,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "الخدمة غير متاحة",
    message: "الخادم غير متاح حالياً، يرجى المحاولة لاحقاً",
  },
  504: {
    icon: TimerOff,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "انتهت مهلة الخادم",
    message: "لم يستجب الخادم في الوقت المناسب، يرجى المحاولة لاحقاً",
  },
};

const DEFAULT_CONFIG: ErrorConfig = {
  icon: AlertCircle,
  iconBg: "bg-red-50",
  iconColor: "text-red-500",
  title: "حدث خطأ ما",
  message: "تعذر تحميل البيانات، يرجى المحاولة مرة أخرى",
};

function getConfig(status?: number | null): ErrorConfig {
  if (!status) return DEFAULT_CONFIG;
  if (ERROR_CONFIG[status]) return ERROR_CONFIG[status];
  // Fall back to the family default (4xx vs 5xx) for unlisted codes.
  if (status >= 500) return ERROR_CONFIG[500];
  if (status >= 400) return DEFAULT_CONFIG;
  return DEFAULT_CONFIG;
}

/** Centered error state with an optional retry button; adapts icon/title to the HTTP status and shows the code to the user. */
function ErrorState({ message, onRetry, status }: ErrorStateProps) {
  const config = getConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div
        className={`h-14 w-14 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}
      >
        <Icon className={`h-7 w-7 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{config.title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        {message || config.message}
      </p>
      {!!status && (
        <p className="text-xs text-slate-400 mt-1 mb-5">رمز الخطأ: {status}</p>
      )}
      {!status && <div className="mb-5" />}
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
