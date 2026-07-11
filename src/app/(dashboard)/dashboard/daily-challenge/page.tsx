"use client";

import { useEffect, useState } from "react";
import {
  ListChecks,
  ArrowLeft,
  CheckCircle2,
  Circle,
  RefreshCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDailyChallenges,
  createDailyChallenge,
} from "@/api/daily-challenge";
import { getQuestionById } from "@/api/question";
import { downloadFile } from "@/api/files";
import { Challenge, UnusedQuestionSummary } from "@/types/daily-challenge";
import { Question, QuestionType } from "@/types/question";

const TYPE_META: Record<QuestionType, { label: string; className: string }> = {
  options: {
    label: "اختيار متعدد",
    className: "bg-blue-100 text-blue-600 border-blue-200",
  },
  match: {
    label: "توصيل",
    className: "bg-violet-100 text-violet-600 border-violet-200",
  },
};

function FileImage({
  fileId,
  alt,
  className,
}: {
  fileId: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;
    downloadFile(fileId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

export default function DailyChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [unUsedQuestions, setUnUsedQuestions] = useState<
    UnusedQuestionSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [questionDetails, setQuestionDetails] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedQuestionId) return;
    setQuestionDetails(null);
    setQuestionError(null);
    setQuestionLoading(true);
    getQuestionById(selectedQuestionId)
      .then((res) => setQuestionDetails(res.data))
      .catch((e) => setQuestionError((e as Error).message))
      .finally(() => setQuestionLoading(false));
  }, [selectedQuestionId]);

  async function fetchChallenges() {
    setLoading(true);
    setError(null);
    try {
      const res = await getDailyChallenges();
      setChallenges(res.data.challenges);
      setUnUsedQuestions(res.data.unUsedQuestions);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      await createDailyChallenge();
      await fetchChallenges();
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  const totalQuestionsUsed = challenges.reduce(
    (sum, c) => sum + c.usedQuestions.length,
    0,
  );
  const activeTracks = new Set(challenges.map((c) => c.track.id)).size;
  const totalRemainingQuestions = unUsedQuestions.reduce(
    (sum, q) => sum + q.remainingQuestions,
    0,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">التحدي اليومي</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة التحديات اليومية للطلاب
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ActionButton
            label={creating ? "جاري إنشاء التحدي" : "توليد التحدي اليومي"}
            icon={RefreshCcw}
            bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            disabled={creating}
            onClick={handleCreate}
          />
          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          {loading ? (
            <Skeleton className="h-8 w-12 mb-2" />
          ) : (
            <span className="text-3xl font-bold text-emerald-500 mb-2">
              {challenges.length}
            </span>
          )}
          <span className="text-sm text-slate-500 font-medium">
            عدد التحديات
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          {loading ? (
            <Skeleton className="h-8 w-12 mb-2" />
          ) : (
            <span className="text-3xl font-bold text-blue-600 mb-2">
              {totalQuestionsUsed}
            </span>
          )}
          <span className="text-sm text-slate-500 font-medium">
            الأسئلة المستخدمة
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          {loading ? (
            <Skeleton className="h-8 w-12 mb-2" />
          ) : (
            <span className="text-3xl font-bold text-amber-500 mb-2">
              {activeTracks}
            </span>
          )}
          <span className="text-sm text-slate-500 font-medium">
            المسارات النشطة
          </span>
        </Card>
        <Card className="border-slate-200 shadow-xs p-4 flex flex-col items-center justify-center py-6">
          {loading ? (
            <Skeleton className="h-8 w-12 mb-2" />
          ) : (
            <span className="text-3xl font-bold text-purple-600 mb-2">
              {totalRemainingQuestions}
            </span>
          )}
          <span className="text-sm text-slate-500 font-medium">
            أسئلة متبقية غير مستخدمة
          </span>
        </Card>
      </div>

      {loading && (
        <>
          {/* Challenges Table Skeleton */}
          <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      التاريخ
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      المسار
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      عدد الأسئلة
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      الأسئلة المستخدمة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1.5">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Unused Questions Summary Skeleton */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              الأسئلة غير المستخدمة
            </h2>
            <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-center whitespace-nowrap">
                        المسار
                      </th>
                      <th className="px-4 py-4 text-center whitespace-nowrap">
                        المادة
                      </th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">
                        الأسئلة المتبقية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 py-16">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Challenges Table */}
          <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      التاريخ
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      المسار
                    </th>
                    <th className="px-4 py-4 text-center whitespace-nowrap">
                      عدد الأسئلة
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      الأسئلة المستخدمة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {challenges.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-slate-400"
                      >
                        لا توجد تحديات بعد
                      </td>
                    </tr>
                  )}
                  {challenges.map((challenge) => (
                    <tr
                      key={challenge.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-slate-700 font-medium whitespace-nowrap">
                        {challenge.date}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                        {challenge.track.name}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                        {challenge.usedQuestions.length}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {challenge.usedQuestions.map((uq) => (
                            <button
                              key={uq.id}
                              type="button"
                              onClick={() =>
                                setSelectedQuestionId(uq.question.id)
                              }
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                            >
                              {uq.question.title}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Unused Questions Summary */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              الأسئلة غير المستخدمة
            </h2>
            <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-center whitespace-nowrap">
                        المسار
                      </th>
                      <th className="px-4 py-4 text-center whitespace-nowrap">
                        المادة
                      </th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">
                        الأسئلة المتبقية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {unUsedQuestions.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          لا توجد أسئلة متبقية
                        </td>
                      </tr>
                    )}
                    {unUsedQuestions.map((q) => (
                      <tr
                        key={`${q.trackId}-${q.courseId}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-slate-700 font-medium whitespace-nowrap">
                          {q.trackName}
                        </td>
                        <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                          {q.courseName}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                          {q.remainingQuestions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Question Details Dialog */}
      <Dialog
        open={!!selectedQuestionId}
        onOpenChange={(open) => !open && setSelectedQuestionId(null)}
      >
        <DialogContent
          dir="rtl"
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="pt-5">تفاصيل السؤال</DialogTitle>
          </DialogHeader>

          {questionLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          )}

          {!questionLoading && questionError && (
            <p className="text-center text-red-500 py-10">{questionError}</p>
          )}

          {!questionLoading && !questionError && questionDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-lg">
                  {questionDetails.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    TYPE_META[questionDetails.type].className
                  }`}
                >
                  {TYPE_META[questionDetails.type].label}
                </span>
              </div>

              {questionDetails.imageId && (
                <FileImage
                  fileId={questionDetails.imageId}
                  alt={questionDetails.title}
                  className="max-h-52 rounded-lg border border-slate-200"
                />
              )}

              {questionDetails.type === "options" && (
                <div className="space-y-2">
                  {questionDetails.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        option.isCorrect
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {option.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      {option.text}
                    </div>
                  ))}
                </div>
              )}

              {questionDetails.type === "match" &&
                (() => {
                  const matchItems = questionDetails.matchingItems.filter(
                    (m) => m.type === "match",
                  );
                  const baseItems = questionDetails.matchingItems.filter(
                    (m) => m.type === "base",
                  );
                  const decoys = matchItems.filter(
                    (m) => !baseItems.some((b) => b.correctMatchId === m.id),
                  );
                  return (
                    <div className="space-y-2">
                      {baseItems.map((base) => {
                        const paired = matchItems.find(
                          (m) => m.id === base.correctMatchId,
                        );
                        return (
                          <div
                            key={base.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                              {base.text}
                            </span>
                            <ArrowLeft className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                              {paired?.text ?? "—"}
                            </span>
                          </div>
                        );
                      })}
                      {decoys.length > 0 && (
                        <p className="text-xs text-slate-400">
                          إجابات تمويه: {decoys.map((d) => d.text).join("، ")}
                        </p>
                      )}
                    </div>
                  );
                })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
