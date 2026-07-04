const ERROR_MESSAGES: Record<string, string> = {
  // School
  School_1: "يجب تحديد مدرسة للمتابعة",

  // Main errors
  BAD_INPUT: "البيانات المُدخلة غير صحيحة",
  NOT_FOUND: "العنصر المطلوب غير موجود",
  FORBIDDEN: "ليس لديك صلاحية الوصول إلى هذا المورد",
  CONFLICT: "هذا العنصر موجود مسبقاً أو يتعارض مع بيانات أخرى",
  INTERNAL: "حدث خطأ داخلي في الخادم",
  UNPROCESSABLE_ENTITY: "تعذّر معالجة الطلب",
  UNAUTHENTICATED: "يجب تسجيل الدخول أولاً",
  UNAUTHORIZED: "غير مصرح لك بتنفيذ هذا الإجراء",
  INVALID_JWT_TOKEN: "رمز الجلسة غير صالح",
  JWT_TOKEN_EXPIRED: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً",
  FORBIDDEN_QUERY_FIELD: "أحد حقول الاستعلام غير مسموح به",
  FORBIDDEN_BODY_FIELD: "أحد حقول البيانات غير مسموح به",
  WRONG_OTP: "رمز التحقق غير صحيح",
  WRONG_PASSWORD: "كلمة المرور غير صحيحة",
  EMAIL_NOT_FOUND: "البريد الإلكتروني غير مسجّل",
  USER_NOT_FOUND: "المستخدم غير موجود",
  UNKNOWN_ERROR: "حدث خطأ غير معروف",
  PASSWORD_MISSMATCH: "كلمتا المرور غير متطابقتين",
  FILE_SIZE_NOT_ALLOWED: "حجم الملف غير مسموح به",
  FILE_TYPE_NOT_ALLOWED: "نوع الملف غير مدعوم",
  ACCOUNT_NOT_COMPLETED_YET: "لم يكتمل إعداد الحساب بعد",
  INVALID_CREDENTIALS: "بيانات الدخول غير صحيحة",
  USER_ALREADY_EXISTS: "هذا المستخدم مسجّل مسبقاً",
  VERSION_NOT_SUPPORTED: "هذا الإصدار غير مدعوم",
  ACCOUNT_NOT_VERIFIED_YET: "الحساب لم يتم التحقق منه بعد",
  Learning_01: "لا تملك المدرسة صلاحية الوصول إلى هذا المسار",
};

const FALLBACK = "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى";

export function getArabicError(code?: string): string {
  if (!code) return FALLBACK;
  return ERROR_MESSAGES[code] ?? FALLBACK;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
}

export class ApiError extends Error {
  code?: string;

  constructor(code?: string) {
    super(getArabicError(code));
    this.name = "ApiError";
    this.code = code;
  }
}
