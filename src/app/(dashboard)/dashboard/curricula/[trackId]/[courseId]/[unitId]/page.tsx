"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  Trash2,
  Loader2,
  FileText,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ListCardSkeleton } from "@/components/ui/skeleton";
import {
  getUnitLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/api/lesson";
import { Lesson, LessonStatus } from "@/types/lesson";

const STATUS_META: Record<LessonStatus, { label: string; className: string }> =
  {
    active: {
      label: "نشط",
      className: "bg-emerald-100 text-emerald-600 border-emerald-200",
    },
    draft: {
      label: "مسودة",
      className: "bg-amber-100 text-amber-600 border-amber-200",
    },
    unActive: {
      label: "غير نشط",
      className: "bg-slate-100 text-slate-500 border-slate-200",
    },
  };

const STATUS_OPTIONS: LessonStatus[] = ["active", "unActive"];

export default function UnitLessonsPage() {
  const { trackId, courseId, unitId } = useParams<{
    trackId: string;
    courseId: string;
    unitId: string;
  }>();
  const router = useRouter();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchLessons() {
    setLoading(true);
    setError(null);
    try {
      const res = await getUnitLessons(unitId);
      setLessons([...res.data].sort((a, b) => a.index - b.index));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const description = descriptionRef.current!.value.trim();
      await createLesson({
        title: titleRef.current!.value,
        ...(description ? { description } : {}),
        unitId,
      });
      setCreateOpen(false);
      fetchLessons();
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id);
    setEditTitle(lesson.title);
    setEditDescription(lesson.description ?? "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(lesson: Lesson) {
    const title = editTitle.trim();
    if (!title) return;

    const description = editDescription.trim();
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateLesson(lesson.id, {
        title,
        ...(description ? { description } : {}),
      });
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id
            ? { ...l, title, description: description || l.description }
            : l,
        ),
      );
      setEditingId(null);
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function changeStatus(lesson: Lesson, status: LessonStatus) {
    if (status === lesson.status) return;
    if (!lesson.questionCount) return;

    setStatusUpdatingId(lesson.id);
    setStatusError(null);
    try {
      await updateLesson(lesson.id, { status });
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? { ...l, status } : l)),
      );
    } catch (e) {
      setStatusError((e as Error).message);
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLesson(deleteTarget.id);
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function moveLesson(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const reordered = [...lessons];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setLessons(reordered);
    setReorderError(null);
    setSavingOrder(true);
    try {
      await reorderLessons(
        unitId,
        reordered.map((l) => l.id),
      );
    } catch (e) {
      setReorderError((e as Error).message);
      fetchLessons();
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">دروس الوحدة</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              إدارة دروس هذه الوحدة وترتيبها
            </p>
          </div>
        </div>
        <ActionButton
          label="إضافة درس"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          onClick={() => {
            setCreateError(null);
            setCreateOpen(true);
          }}
        />
      </div>

      {reorderError && (
        <p className="text-sm text-red-500 text-center">{reorderError}</p>
      )}

      {statusError && (
        <p className="text-sm text-red-500 text-center">{statusError}</p>
      )}

      {loading && <ListCardSkeleton />}

      {!loading && error && (
        <p className="text-center text-red-500 py-16">{error}</p>
      )}

      {!loading && !error && lessons.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد دروس لهذه الوحدة بعد
        </p>
      )}

      {!loading && !error && lessons.length > 0 && (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson, index) => {
            const isEditing = editingId === lesson.id;
            const status = STATUS_META[lesson.status];
            const canChangeStatus = (lesson.questionCount ?? 0) > 0;
            return (
              <Card
                key={lesson.id}
                title={
                  canChangeStatus
                    ? undefined
                    : "لا توجد أسئلة لهذا الدرس بعد — أضف أسئلة لتتمكن من تفعيله"
                }
                onClick={() => {
                  if (isEditing) return;
                  router.push(
                    `/dashboard/curricula/${trackId}/${courseId}/${unitId}/${lesson.id}`,
                  );
                }}
                className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  {isEditing ? (
                    <div
                      className="flex-1 min-w-0 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-10"
                        autoFocus
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="وصف الدرس (اختياري)"
                        rows={2}
                      />
                      {editError && (
                        <p className="text-xs text-red-500 mt-1">{editError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {lesson.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        عدد الأسئلة: {lesson.questionCount ?? 0}
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1 shrink-0 w-full md:w-auto justify-end border-t border-slate-50 md:border-0 pt-3 md:pt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger
                      disabled={
                        statusUpdatingId === lesson.id || !canChangeStatus
                      }
                      title={
                        canChangeStatus
                          ? undefined
                          : "أضف أسئلة للدرس أولاً لتتمكن من تغيير حالته"
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ml-2 ${status.className} ${
                        canChangeStatus ? "" : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {statusUpdatingId === lesson.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        canChangeStatus && <ChevronDown className="h-3 w-3" />
                      )}
                      {status.label}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {STATUS_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          disabled={option === lesson.status}
                          onClick={() => changeStatus(lesson, option)}
                        >
                          {STATUS_META[option].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === 0 || savingOrder}
                    onClick={() => moveLesson(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === lessons.length - 1 || savingOrder}
                    onClick={() => moveLesson(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>

                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={editSubmitting}
                        onClick={() => saveEdit(lesson)}
                      >
                        <Check className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={editSubmitting}
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(lesson)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(lesson);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Lesson Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">إضافة درس جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-3">
              <Label htmlFor="lesson-title">عنوان الدرس</Label>
              <Input id="lesson-title" ref={titleRef} required />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lesson-description">وصف الدرس (اختياري)</Label>
              <Textarea id="lesson-description" ref={descriptionRef} rows={3} />
            </div>
            {createError && (
              <p className="text-sm text-red-500">{createError}</p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="p-4 h-12"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={creating} className="p-4 h-12">
                {creating ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>حذف الدرس</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف درس &quot;{deleteTarget?.title}&quot;؟ لا يمكن
            التراجع عن هذا الإجراء.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="p-4 h-12"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
              className="p-4 h-12"
            >
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
