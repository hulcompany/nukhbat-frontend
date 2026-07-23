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
  Layers,
  Plus,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  getCourseUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  reorderUnits,
} from "@/api/unit";
import { getUnitLessons } from "@/api/lesson";
import { Unit } from "@/types/unit";

export default function CourseUnitsPage() {
  const { trackId, courseId } = useParams<{
    trackId: string;
    courseId: string;
  }>();
  const router = useRouter();

  const [units, setUnits] = useState<Unit[]>([]);
  const [questionCounts, setQuestionCounts] = useState<
    Record<string, number | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchUnits() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCourseUnits(courseId);
      const sorted = [...res.data].sort((a, b) => a.index - b.index);
      setUnits(sorted);

      const counts = await Promise.all(
        sorted.map(async (unit) => {
          try {
            const lessonsRes = await getUnitLessons(unit.id);
            const total = lessonsRes.data.reduce(
              (sum, lesson) => sum + (lesson.questionCount ?? 0),
              0,
            );
            return [unit.id, total] as const;
          } catch {
            return [unit.id, null] as const;
          }
        }),
      );
      setQuestionCounts(Object.fromEntries(counts));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createUnit({ title: titleRef.current!.value, courseId });
      setCreateOpen(false);
      fetchUnits();
    } catch (e) {
      setCreateError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(unit: Unit) {
    setEditingId(unit.id);
    setEditValue(unit.title);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(unit: Unit) {
    const title = editValue.trim();
    if (!title) return;

    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateUnit(unit.id, { title });
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, title } : u)),
      );
      setEditingId(null);
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUnit(deleteTarget.id);
      setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function moveUnit(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= units.length) return;

    const reordered = [...units];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setUnits(reordered);
    setReorderError(null);
    setSavingOrder(true);
    try {
      await reorderUnits(
        courseId,
        reordered.map((u) => u.id),
      );
    } catch (e) {
      setReorderError((e as Error).message);
      fetchUnits();
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
            <h1 className="text-xl md:text-2xl font-bold">وحدات المادة</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              إدارة وحدات هذه المادة وترتيبها
            </p>
          </div>
        </div>
        <ActionButton
          label="إضافة وحدة"
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

      {loading && <ListCardSkeleton />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchUnits} />
      )}

      {!loading && !error && units.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد وحدات لهذه المادة بعد
        </p>
      )}

      {!loading && !error && units.length > 0 && (
        <div className="flex flex-col gap-4">
          {units.map((unit, index) => {
            const isEditing = editingId === unit.id;
            return (
              <Card
                key={unit.id}
                onClick={() => {
                  if (isEditing) return;
                  router.push(
                    `/dashboard/curricula/${trackId}/${courseId}/${unit.id}`,
                  );
                }}
                className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  {isEditing ? (
                    <div
                      className="flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-10"
                        autoFocus
                      />
                      {editError && (
                        <p className="text-xs text-red-500 mt-1">{editError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        عدد الأسئلة: {questionCounts[unit.id] ?? "—"}
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1 shrink-0 w-full md:w-auto justify-end border-t border-slate-50 md:border-0 pt-3 md:pt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === 0 || savingOrder}
                    onClick={() => moveUnit(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === units.length - 1 || savingOrder}
                    onClick={() => moveUnit(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>

                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={editSubmitting}
                        onClick={() => saveEdit(unit)}
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
                      onClick={() => startEdit(unit)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(unit);
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

      {/* Create Unit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">إضافة وحدة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-3">
              <Label htmlFor="unit-title">عنوان الوحدة</Label>
              <Input id="unit-title" ref={titleRef} required />
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
            <DialogTitle>حذف الوحدة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف وحدة &quot;{deleteTarget?.title}&quot;؟ لا يمكن
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
