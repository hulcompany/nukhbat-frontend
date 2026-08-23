"use client";

import { useEffect, useState } from "react";
import {
  Search,
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
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getSchoolAttempts } from "@/api/attempts";
import { Attempt } from "@/types/attempt";
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
  const [lessonIdFilter, setLessonIdFilter] = useState("");

  // Details Dialog State
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

  function fetchAttempts() {
    setLoading(true);
    setError(null);

    // بناء المتغيرات بناءً على الفلاتر النشطة
    const params: any = {
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort,
    };

    if (completedFilter !== "all") {
      params.completed = completedFilter === "true";
    }

    if (lessonIdFilter.trim() !== "") {
      params.lessonId = lessonIdFilter.trim();
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
  }, [page, sort, completedFilter, lessonIdFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          {/* <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="بحث بمعرف الدرس (Lesson ID)..."
              className="w-full pl-9 h-10 text-left placeholder:text-right"
              dir="ltr"
              value={lessonIdFilter}
              onChange={(e) => {
                setLessonIdFilter(e.target.value);
                setPage(0); // إعادة تعيين الصفحة عند البحث
              }}
            />
          </div> */}

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              value={completedFilter}
              onChange={(e) => {
                setCompletedFilter(e.target.value as "all" | "true" | "false");
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
        <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">الطالب</th>
                  <th className="px-6 py-4 whitespace-nowrap">المادة والدرس</th>
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
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {attempt.result?.passed ? (
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

      {/* Attempt Details Dialog */}
      <Dialog
        open={!!selectedAttempt}
        onOpenChange={(open) => !open && setSelectedAttempt(null)}
      >
        <DialogContent
          dir="rtl"
          className="
            w-[calc(100vw-24px)]
            max-w-6xl
            h-[calc(100vh-32px)]
            max-h-[calc(100vh-32px)]
            p-0
            gap-0
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-slate-50
            shadow-2xl
            flex flex-col
          "
        >
          {/* Header - Fixed at the top */}
          <DialogHeader className="px-5 md:px-7 py-5 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-lg md:text-xl font-bold text-slate-900">
                  تفاصيل المحاولة
                </DialogTitle>

                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  تفاصيل أداء الطالب والإجابات والنتيجة النهائية
                </p>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full"
              onClick={() => setSelectedAttempt(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          {/* Scrollable Content */}
          {selectedAttempt && (
            <div
              className="
                flex-1
                overflow-y-auto
                p-4 md:p-6 lg:p-7
                space-y-6
                bg-slate-50
                scrollbar-thin
                scrollbar-thumb-slate-300
                scrollbar-track-transparent
              "
            >
              {/* Attempt Meta Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
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

              {/* Questions List Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 lg:p-7 space-y-5">
                <h3 className="font-bold text-base md:text-lg text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  تفاصيل الإجابات (
                  {selectedAttempt.result?.verdicts?.length ?? 0})
                </h3>

                <div className="space-y-4">
                  {selectedAttempt.result?.verdicts?.length > 0 ? (
                    selectedAttempt.result.verdicts.map(
                      (verdictItem, index) => (
                        <div
                          key={verdictItem.id}
                          className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                        >
                          {/* Status Indicator Sidebar - Responsive sizing */}
                          <div
                            className={`h-2 md:h-auto w-full md:w-2 shrink-0 transition-colors ${
                              verdictItem.isSkipped
                                ? "bg-slate-300"
                                : verdictItem.verdict
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                            }`}
                          />

                          <div className="p-4 flex-1 space-y-3">
                            {/* Question Meta Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-3">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                                  {getQuestionTypeLabel(verdictItem.type)}
                                </span>
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
                                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                    إجابة صحيحة
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                                    <XCircle className="w-3.5 h-3.5" /> إجابة
                                    خاطئة
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Question Content */}
                            <div className="text-slate-800 text-sm leading-loose whitespace-pre-wrap font-medium p-3 bg-slate-50/50 rounded-lg border border-slate-50">
                              {verdictItem.title}
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">
                        لا توجد تفاصيل إجابات متاحة لهذه المحاولة.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
