"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Eye,
  Zap,
  BookOpen,
  CalendarClock,
  User,
  Activity,
  Trophy,
  ArrowRight,
  Flame,
  Gem,
  Hash,
  Layers3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FileImage } from "@/components/ui/file-image";
import { getSchoolAttempts, GetSchoolAttemptsParams } from "@/api/attempts";
import { Attempt } from "@/types/attempt";
import { formatQuestionTitle } from "@/types/question";
import { ApiError } from "@/lib/errors";

const PAGE_SIZE = 10;

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateParts(iso: string) {
  const date = new Date(iso);

  return {
    date: date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function getQuestionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    options: "اختيار من متعدد",
    match: "توصيل",
    fillBlanks: "ملء الفراغات",
    trueFalse: "صح أو خطأ",
    order: "ترتيب",
    classify: "تصنيف",
  };
  return map[type] || type;
}

function richTextToPlainText(value: string): string {
  return value
    .replace(
      /<span[^>]*class=["'][^"']*ql-formula[^"']*["'][^>]*data-value=["']([^"']*)["'][^>]*><\/span>/gi,
      "$1",
    )
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function formatOptionalDate(value: string | null | undefined): string {
  if (!value) return "غير متوفر";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: value.includes("T") ? "2-digit" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  });
}

function DetailItem({
  label,
  value,
  dir,
}: {
  label: string;
  value: ReactNode;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="mb-1 text-[11px] font-semibold text-slate-400">{label}</p>
      <div
        dir={dir}
        className="break-words text-sm font-semibold text-slate-800"
      >
        {value}
      </div>
    </div>
  );
}

const ANSWER_FIELD_LABELS: Record<string, string> = {
  answered: "إجابة الطالب",
  correctAnswer: "الإجابة الصحيحة",
  answeredBase: "العنصر الذي اختاره الطالب",
  answeredMatch: "الإجابة التي اختارها الطالب",
  baseCorrectMatch: "الإجابة الصحيحة للعنصر",
  matchCorrectBase: "العنصر الصحيح للإجابة",
  verdict: "نتيجة المطابقة",
  skipped: "تم التخطي",
  index: "الترتيب",
  text: "النص",
  type: "النوع",
  isCorrect: "إجابة صحيحة",
  correctIndex: "رقم الإجابة الصحيحة",
  correctCategoryIndex: "رقم التصنيف الصحيح",
  selectedIndex: "الاختيار",
  answer: "الإجابة",
  answers: "الإجابات",
  matched: "التوصيلات",
  order: "الترتيب",
};

const ANSWER_VALUE_LABELS: Record<string, string> = {
  base: "عنصر أساسي",
  match: "إجابة مطابقة",
  category: "تصنيف",
  item: "عنصر",
};

const STUDENT_ANSWER_FIELDS = new Set([
  "answered",
  "answeredBase",
  "answeredMatch",
]);
const CORRECT_ANSWER_FIELDS = new Set([
  "correctAnswer",
  "baseCorrectMatch",
  "matchCorrectBase",
]);

function shouldHideAnswerField(key: string): boolean {
  return key === "id" || key.toLowerCase().endsWith("id");
}

function AnswerValue({
  value,
  level = 0,
  fieldKey,
}: {
  value: unknown;
  level?: number;
  fieldKey?: string;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">غير متوفر</span>;
  }

  if (typeof value === "boolean") {
    const booleanLabel =
      fieldKey === "skipped"
        ? value
          ? "نعم"
          : "لا"
        : fieldKey === "verdict" || fieldKey === "isCorrect"
          ? value
            ? "صحيحة"
            : "خاطئة"
          : value
            ? "صح"
            : "خطأ";

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
          value ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {booleanLabel}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400">لا توجد عناصر</span>;
    }

    const containsObjects = value.some(
      (item) => item !== null && typeof item === "object",
    );

    return (
      <div className={containsObjects ? "space-y-3" : "flex flex-wrap gap-2"}>
        {value.map((item, index) => (
          <div
            key={index}
            className={
              containsObjects
                ? "rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:p-4"
                : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm"
            }
          >
            {containsObjects && value.length > 1 && (
              <p className="mb-3 text-xs font-bold text-slate-500">
                التفصيل {index + 1}
              </p>
            )}
            <AnswerValue value={item} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const visibleEntries = Object.entries(
      value as Record<string, unknown>,
    ).filter(([key]) => !shouldHideAnswerField(key));

    if (visibleEntries.length === 0) {
      return <span className="text-slate-400">لا توجد تفاصيل إضافية</span>;
    }

    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visibleEntries.map(([key, nestedValue]) => {
          const isStudentAnswer = STUDENT_ANSWER_FIELDS.has(key);
          const isCorrectAnswer = CORRECT_ANSWER_FIELDS.has(key);
          const isComplexValue =
            nestedValue !== null && typeof nestedValue === "object";

          return (
            <div
              key={key}
              className={`min-w-0 rounded-xl border p-3 ${
                isStudentAnswer
                  ? "border-blue-100 bg-blue-50/60"
                  : isCorrectAnswer
                    ? "border-emerald-100 bg-emerald-50/60"
                    : "border-slate-200 bg-slate-50/70"
              } ${isComplexValue && level > 1 ? "sm:col-span-2" : ""}`}
            >
              <p
                className={`mb-2 text-[11px] font-bold ${
                  isStudentAnswer
                    ? "text-blue-700"
                    : isCorrectAnswer
                      ? "text-emerald-700"
                      : "text-slate-500"
                }`}
              >
                {ANSWER_FIELD_LABELS[key] ?? key}
              </p>
              <div className="text-sm font-semibold text-slate-800">
                <AnswerValue
                  value={nestedValue}
                  level={level + 1}
                  fieldKey={key}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const displayValue =
    typeof value === "string"
      ? (ANSWER_VALUE_LABELS[value] ?? richTextToPlainText(value))
      : String(value);

  return (
    <span className="whitespace-pre-wrap break-words">{displayValue}</span>
  );
}

export default function AttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Pagination & Filters
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [completedFilter, setCompletedFilter] = useState<
    "all" | "true" | "false"
  >("all");

  // Full-page details state
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const detailsPageRef = useRef<HTMLElement>(null);

  function fetchAttempts() {
    setLoading(true);
    setError(null);

    // بناء المتغيرات بناءً على الفلاتر النشطة
    const params: GetSchoolAttemptsParams = {
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort,
    };

    if (completedFilter !== "all") {
      params.completed = completedFilter === "true";
    }

    getSchoolAttempts(params)
      .then((res) => {
        setAttempts(res.data.list);
        setTotalRecords(res.data.totalRecords);
      })
      .catch((e) => setError(formatError(e)))
      .finally(() => setLoading(false));
  }

  // استخدام Debounce لكي لا يتم استدعاء API مع كل حرف يكتبه المستخدم في مربع البحث
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAttempts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, completedFilter]);

  useEffect(() => {
    if (!selectedAttempt) return;
    requestAnimationFrame(() => {
      detailsPageRef.current?.scrollIntoView({ block: "start" });
    });
  }, [selectedAttempt]);

  return (
    <div
      className={
        selectedAttempt
          ? "min-h-screen w-full bg-slate-50 pb-8"
          : "mx-auto max-w-7xl space-y-6 p-1 pb-8"
      }
      dir="rtl"
    >
      <div className={selectedAttempt ? "hidden" : "contents"}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">سجل المحاولات</h1>
            <p className="text-sm text-slate-500 mt-1">
              متابعة محاولات الطلاب لحل الدروس والتحديات وتقييم أدائهم
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-slate-200 shadow-xs p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                value={completedFilter}
                onChange={(e) => {
                  setCompletedFilter(
                    e.target.value as "all" | "true" | "false",
                  );
                  setPage(0);
                }}
              >
                <option value="all">جميع الحالات</option>
                <option value="true">المحاولات المكتملة</option>
                <option value="false">الغير مكتملة</option>
              </select>

              <select
                className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "ASC" | "DESC");
                  setPage(0);
                }}
              >
                <option value="DESC">الأحدث أولاً</option>
                <option value="ASC">الأقدم أولاً</option>
              </select>

              <Button
                variant="outline"
                onClick={fetchAttempts}
                disabled={loading}
                className="h-10 px-4 shrink-0"
              >
                تحديث
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading & Errors */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin ml-2" />
            جارٍ تحميل المحاولات...
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={fetchAttempts} />
        )}

        {!loading && !error && attempts.length === 0 && (
          <EmptyState
            icon={Activity}
            title="لا توجد محاولات"
            description="لم يقم أي طالب بإجراء محاولات للحل توافق عوامل التصفية الحالية."
          />
        )}

        {/* Attempts Table */}
        {!loading && !error && attempts.length > 0 && (
          <Card className="border-slate-200 shadow-xs overflow-hidden p-0 my-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">الطالب</th>
                    <th className="px-6 py-4 whitespace-nowrap">
                      المادة والدرس
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      النتيجة
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      الحالة
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      الخبرة (XP)
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      التاريخ
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#16192b] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {attempt.student.user.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {attempt.student.user.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {attempt.student.user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course & Lesson */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className="font-semibold text-slate-900 truncate max-w-[200px]"
                            title={attempt.lessonTitle}
                          >
                            {attempt.lessonTitle}
                          </span>
                          <span className="text-xs text-slate-500">
                            {attempt.course.title} · {attempt.track.name}
                          </span>
                          <span className="mt-1 text-[11px] font-medium text-blue-600">
                            المحاولة رقم {attempt.attemptNumber}
                          </span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4 whitespace-nowrap text-center font-bold">
                        <span className="text-emerald-600">
                          {attempt.questionsCorrect}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">
                          {attempt.questionsTotal}
                        </span>
                        {attempt.questionsSkipped > 0 && (
                          <span className="mt-1 block text-[10px] font-medium text-slate-400">
                            متروك: {attempt.questionsSkipped}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {!attempt.completed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <MinusCircle className="h-3.5 w-3.5" /> غير مكتملة
                          </span>
                        ) : attempt.result?.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> اجتاز
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> رسب
                          </span>
                        )}
                      </td>

                      {/* XP */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold">
                          <span>{attempt.xpAwarded}</span>
                          <Zap className="h-4 w-4 fill-amber-500" />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(attempt.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => setSelectedAttempt(attempt)}
                        >
                          <Eye className="w-4 h-4 ml-1.5" />
                          التفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!loading && !error && totalRecords > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              السابق
            </Button>
            <span className="text-sm text-slate-500">
              صفحة {page + 1} من{" "}
              {Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))}
            </span>
            <Button
              variant="outline"
              disabled={(page + 1) * PAGE_SIZE >= totalRecords}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      {/* Full-page attempt details */}
      {selectedAttempt && (
        <section
          ref={detailsPageRef}
          className="min-h-screen w-full bg-slate-50"
        >
          <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between md:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 md:text-2xl">
                  تفاصيل المحاولة
                </h1>
                <p className="mt-1 truncate text-xs text-slate-500 md:text-sm">
                  {selectedAttempt.student.user.name} ·{" "}
                  {selectedAttempt.lessonTitle} · المحاولة رقم{" "}
                  {selectedAttempt.attemptNumber}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => setSelectedAttempt(null)}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى سجل المحاولات
            </Button>
          </header>

          <main className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-4 sm:px-5 md:px-6 md:py-6 lg:px-8 xl:px-10">
            {/* Attempt Meta Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  {selectedAttempt.student.user.profileImage ? (
                    <FileImage
                      fileId={selectedAttempt.student.user.profileImage}
                      alt={selectedAttempt.student.user.name}
                      className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 shrink-0 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      الطالب
                    </p>
                    <p
                      className="font-bold text-slate-900 text-sm break-words leading-6"
                      title={selectedAttempt.student.user.name}
                    >
                      {selectedAttempt.student.user.name}
                    </p>
                    <p
                      dir="ltr"
                      className="truncate text-left text-xs text-slate-500"
                    >
                      {selectedAttempt.student.user.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      المادة والدرس
                    </p>
                    <p
                      className="font-bold text-slate-900 text-sm break-words leading-6"
                      title={`${selectedAttempt.course.title} - ${selectedAttempt.lessonTitle}`}
                    >
                      {selectedAttempt.course.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {selectedAttempt.lessonTitle} ·{" "}
                      {selectedAttempt.track.name}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      النتيجة
                    </p>
                    <p className="font-bold text-slate-900 text-sm break-words leading-6">
                      {selectedAttempt.questionsCorrect} من{" "}
                      {selectedAttempt.questionsTotal} صحيحة
                    </p>
                    <p className="text-xs font-semibold text-emerald-600">
                      {selectedAttempt.questionsTotal > 0
                        ? Math.round(
                            (selectedAttempt.questionsCorrect /
                              selectedAttempt.questionsTotal) *
                              100,
                          )
                        : 0}
                      % · {selectedAttempt.result.passed ? "اجتاز" : "لم يجتز"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                      <CalendarClock className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        تاريخ ووقت الإرسال
                      </p>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm leading-6 break-words">
                          {formatDateParts(selectedAttempt.createdAt).date}
                        </p>

                        <p className="text-xs text-slate-500 font-medium">
                          {formatDateParts(selectedAttempt.createdAt).time}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      بيانات الطالب والحساب
                    </h3>
                    <p className="text-xs text-slate-500">
                      معلومات التواصل والحالة والتقدم الحالي
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="اسم الطالب"
                    value={selectedAttempt.student.user.name}
                  />
                  {/* <DetailItem
                    label="البريد الإلكتروني"
                    value={selectedAttempt.student.user.email}
                    dir="ltr"
                  /> */}
                  <DetailItem
                    label="رقم الهاتف"
                    value={
                      selectedAttempt.student.user.phoneNumber ?? "غير متوفر"
                    }
                    dir="ltr"
                  />
                  {/* <DetailItem
                    label="الدور"
                    value={getRoleLabel(selectedAttempt.student.user.role)}
                  /> */}
                  {/* <DetailItem
                    label="توثيق البريد"
                    value={
                      <span
                        className={
                          selectedAttempt.student.user.emailVerified
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {selectedAttempt.student.user.emailVerified
                          ? "موثّق"
                          : "غير موثّق"}
                      </span>
                    }
                  /> */}
                  <DetailItem
                    label="حالة الطالب"
                    value={
                      <span
                        className={
                          selectedAttempt.student.active
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {selectedAttempt.student.active ? "نشط" : "غير نشط"}
                      </span>
                    }
                  />
                  <DetailItem
                    label="السلسلة الحالية"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-orange-600">
                        <Flame className="h-4 w-4" />
                        {selectedAttempt.student.currentStreak}
                      </span>
                    }
                  />
                  <DetailItem
                    label="أطول سلسلة"
                    value={selectedAttempt.student.longestStreak}
                  />
                  <DetailItem
                    label="إجمالي الخبرة"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <Zap className="h-4 w-4" />
                        {selectedAttempt.student.xp}
                      </span>
                    }
                  />
                  <DetailItem
                    label="الجواهر"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-cyan-600">
                        <Gem className="h-4 w-4" />
                        {selectedAttempt.student.gems}
                      </span>
                    }
                  />
                  <DetailItem
                    label="آخر يوم للسلسلة"
                    value={formatOptionalDate(
                      selectedAttempt.student.lastStreakDate,
                    )}
                  />
                  {/* <DetailItem
                    label="تاريخ إنشاء المستخدم"
                    value={formatOptionalDate(
                      selectedAttempt.student.user.createdAt,
                    )}
                  />
                  <DetailItem
                    label="تاريخ إنشاء الطالب"
                    value={formatOptionalDate(
                      selectedAttempt.student.createdAt,
                    )}
                  /> */}
                  {/* <DetailItem
                    label="معرف الطالب في المحاولة"
                    value={selectedAttempt.studentId}
                    dir="ltr"
                  />
                  <DetailItem
                    label="معرف سجل الطالب"
                    value={selectedAttempt.student.id}
                    dir="ltr"
                  />
                  <DetailItem
                    label="معرف المستخدم في سجل الطالب"
                    value={selectedAttempt.student.userId}
                    dir="ltr"
                  /> */}
                  {/* <DetailItem
                    label="معرف حساب المستخدم"
                    value={selectedAttempt.student.user.id}
                    dir="ltr"
                  />
                  <DetailItem
                    label="معرف مدرسة الطالب"
                    value={selectedAttempt.student.schoolId}
                    dir="ltr"
                  />
                  <DetailItem
                    label="معرف مسار الطالب"
                    value={selectedAttempt.student.trackId}
                    dir="ltr"
                  /> */}
                  {/* <DetailItem
                    label="معرف صورة الحساب"
                    value={
                      selectedAttempt.student.user.profileImage ??
                      "لا توجد صورة"
                    }
                    dir={
                      selectedAttempt.student.user.profileImage ? "ltr" : "rtl"
                    }
                  /> */}
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Layers3 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        تفاصيل المنهاج
                      </h3>
                      <p className="text-xs text-slate-500">
                        المسار والمادة والوحدة والدرس
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      label="المسار"
                      value={selectedAttempt.track.name}
                    />
                    <DetailItem
                      label="المادة"
                      value={selectedAttempt.course.title}
                    />
                    <DetailItem
                      label="الدرس"
                      value={selectedAttempt.lessonTitle}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        بيانات المحاولة والنتيجة
                      </h3>
                      <p className="text-xs text-slate-500">
                        الإحصاءات النهائية والمكافأة
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      label="رقم المحاولة"
                      value={selectedAttempt.attemptNumber}
                    />
                    <DetailItem
                      label="حالة الإكمال"
                      value={
                        selectedAttempt.completed ? "مكتملة" : "غير مكتملة"
                      }
                    />
                    <DetailItem
                      label="نتيجة الاجتياز"
                      value={
                        selectedAttempt.result.passed ? "اجتاز" : "لم يجتز"
                      }
                    />
                    <DetailItem
                      label="مجموع الأسئلة"
                      value={selectedAttempt.questionsTotal}
                    />
                    <DetailItem
                      label="الإجابات الصحيحة"
                      value={selectedAttempt.questionsCorrect}
                    />
                    <DetailItem
                      label="الأسئلة المتروكة"
                      value={selectedAttempt.questionsSkipped}
                    />
                    <DetailItem
                      label="الإجابات الخاطئة"
                      value={Math.max(
                        selectedAttempt.questionsTotal -
                          selectedAttempt.questionsCorrect -
                          selectedAttempt.questionsSkipped,
                        0,
                      )}
                    />
                    <DetailItem
                      label="درجة النتيجة"
                      value={`${selectedAttempt.result.score} / ${selectedAttempt.result.total}`}
                    />
                    <DetailItem
                      label="الصحيح في النتيجة"
                      value={selectedAttempt.result.correct}
                    />
                    <DetailItem
                      label="المتروك في النتيجة"
                      value={selectedAttempt.result.skipped}
                    />
                    <DetailItem
                      label="الخبرة الممنوحة"
                      value={
                        <span className="inline-flex items-center gap-1.5 text-amber-600">
                          <Zap className="h-4 w-4" />
                          {selectedAttempt.xpAwarded}
                        </span>
                      }
                    />
                    <DetailItem
                      label="تاريخ المحاولة"
                      value={formatDate(selectedAttempt.createdAt)}
                    />
                    {/* <div className="sm:col-span-2">
                      <DetailItem
                        label="معرف المحاولة"
                        value={selectedAttempt.id}
                        dir="ltr"
                      />
                    </div> */}
                  </div>
                </section>
              </div>
            </div>

            {/* Questions List Section */}
            <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:p-7">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 md:text-lg">
                      تفاصيل الإجابات
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      مقارنة إجابات الطالب بالإجابات الصحيحة لكل سؤال
                    </p>
                  </div>
                </div>
                <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                  {selectedAttempt.result?.verdicts?.length ?? 0} سؤال
                </span>
              </div>

              <div className="space-y-4">
                {selectedAttempt.result?.verdicts?.length > 0 ? (
                  selectedAttempt.result.verdicts.map((verdictItem, index) => (
                    <article
                      key={verdictItem.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                    >
                      <div
                        className={`h-1.5 w-full transition-colors ${
                          verdictItem.isSkipped
                            ? "bg-slate-300"
                            : verdictItem.verdict
                              ? "bg-emerald-500"
                              : "bg-red-500"
                        }`}
                      />

                      <div className="space-y-4 p-4 sm:p-5 lg:p-6">
                        {/* Question Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-[11px] font-medium text-slate-400">
                                السؤال {index + 1}
                              </p>
                              <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {getQuestionTypeLabel(verdictItem.type)}
                              </span>
                            </div>
                          </div>

                          {/* Verdict Badge */}
                          <div>
                            {verdictItem.isSkipped ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                                <MinusCircle className="w-3.5 h-3.5" /> تم
                                التخطي
                              </span>
                            ) : verdictItem.verdict ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> إجابة
                                صحيحة
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                                <XCircle className="w-3.5 h-3.5" /> إجابة خاطئة
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                          <p className="mb-2 text-[11px] font-bold text-slate-400">
                            نص السؤال
                          </p>
                          <p className="whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-800 md:text-base">
                            {richTextToPlainText(
                              formatQuestionTitle(verdictItem.title),
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                            <div className="mb-3 flex items-center gap-2 text-blue-700">
                              <User className="h-4 w-4" />
                              <p className="text-xs font-bold">إجابة الطالب</p>
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              <AnswerValue
                                value={verdictItem.result.answered}
                                fieldKey="answered"
                              />
                            </div>
                          </div>
                          <div className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <div className="mb-3 flex items-center gap-2 text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <p className="text-xs font-bold">
                                الإجابة الصحيحة
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              <AnswerValue
                                value={verdictItem.result.correctAnswer}
                                fieldKey="correctAnswer"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                          <span className="text-slate-500">حالة التصحيح:</span>
                          <span
                            className={`font-bold ${
                              verdictItem.result.verdict
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {verdictItem.result.verdict ? "صحيحة" : "خاطئة"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">التخطي:</span>
                          <span className="font-bold text-slate-700">
                            {verdictItem.result.skipped ? "نعم" : "لا"}
                          </span>
                        </div>

                        {verdictItem.result.verdicts &&
                          verdictItem.result.verdicts.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40">
                              <div className="flex items-start gap-3 border-b border-indigo-100 px-4 py-3 sm:px-5">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                  <Layers3 className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    تفاصيل التصحيح
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    توضيح اختيار الطالب والمطابقة الصحيحة لكل
                                    عنصر
                                  </p>
                                </div>
                              </div>
                              <div className="p-3 sm:p-4">
                                <AnswerValue
                                  value={verdictItem.result.verdicts}
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">
                      لا توجد تفاصيل إجابات متاحة لهذه المحاولة.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </section>
      )}
    </div>
  );
}
