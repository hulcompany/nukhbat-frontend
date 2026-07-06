"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Lightbulb,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWisdomList,
  getTodayWisdom,
  createWisdom,
  updateWisdom,
  deleteWisdom,
  bulkDeleteWisdom,
} from "@/api/wisdom";
import { Wisdom } from "@/types/wisdom";
import { ApiError } from "@/lib/errors";

const LIMIT = 10;

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA");
}

function WisdomFormDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Wisdom | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(editing?.text ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setFormError("يجب إدخال نص الحكمة");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await updateWisdom(editing.id, { text: trimmed });
      } else {
        await createWisdom({ text: trimmed });
      }
      onSaved();
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="pt-5">
            {editing ? "تعديل الحكمة" : "إضافة حكمة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-3">
            <Label htmlFor="wisdom-text">نص الحكمة</Label>
            <Textarea
              id="wisdom-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="p-4 h-11"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting} className="p-4 h-11">
              {submitting
                ? "جاري الحفظ..."
                : editing
                  ? "حفظ التعديلات"
                  : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function WisdomPage() {
  const [today, setToday] = useState<Wisdom | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);

  const [wisdoms, setWisdoms] = useState<Wisdom[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasBack, setHasBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingWisdom, setEditingWisdom] = useState<Wisdom | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Wisdom | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  function fetchToday() {
    setTodayLoading(true);
    getTodayWisdom()
      .then((res) => setToday(res.data))
      .catch(() => setToday(null))
      .finally(() => setTodayLoading(false));
  }

  function fetchWisdoms() {
    setLoading(true);
    setError(null);
    getWisdomList({ skip, limit: LIMIT })
      .then((res) => {
        setWisdoms(res.data.list);
        setTotalRecords(res.data.totalRecords);
        setHasNext(res.data.next);
        setHasBack(res.data.back);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchToday();
  }, []);

  useEffect(() => {
    fetchWisdoms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  function refetchAll() {
    fetchToday();
    fetchWisdoms();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteWisdom(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      refetchAll();
    } catch (e) {
      setDeleteError(formatError(e));
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;

    setBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      await bulkDeleteWisdom(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      refetchAll();
    } catch (e) {
      setBulkDeleteError(formatError(e));
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">حكمة اليوم</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الحكم اليومية المعروضة للطلاب
          </p>
        </div>
        <ActionButton
          label="إضافة حكمة"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          onClick={() => {
            setEditingWisdom(null);
            setFormOpen(true);
          }}
        />
      </div>

      {/* Today's Wisdom */}
      <Card className="border-[#f1e5a1] bg-[#fff9db] p-0">
        <CardContent className="p-4 flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 fill-amber-100 shrink-0" />
          {todayLoading ? (
            <Skeleton className="h-4 w-2/3" />
          ) : today ? (
            <p className="text-sm font-medium text-amber-800">
              حكمة اليوم: {today.text}
            </p>
          ) : (
            <p className="text-sm font-medium text-amber-800">
              لا توجد حكمة معروضة اليوم
            </p>
          )}
        </CardContent>
      </Card>

      {!loading && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm text-red-700 font-medium">
            تم تحديد {selectedIds.size} حكمة
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              إلغاء التحديد
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setBulkDeleteError(null);
                setBulkDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 ml-1" /> حذف المحدد
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-slate-200 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center whitespace-nowrap w-10"></th>
                <th className="px-6 py-4 whitespace-nowrap">نص الحكمة</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  الحالة
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-64" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && wisdoms.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    لا توجد حكم مضافة بعد
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                wisdoms.map((wisdom) => (
                  <tr
                    key={wisdom.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        checked={selectedIds.has(wisdom.id)}
                        onChange={() => toggleSelect(wisdom.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium max-w-xl">
                      {wisdom.text}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                      {formatDate(wisdom.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {wisdom.selected && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-600 border-emerald-200">
                            حكمة اليوم
                          </span>
                        )}
                        {wisdom.usedPreviously && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            مستخدمة سابقاً
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                          title="تعديل"
                          onClick={() => {
                            setEditingWisdom(wisdom);
                            setFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="حذف"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(wisdom);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && !error && totalRecords > LIMIT && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSkip((s) => Math.max(0, s - LIMIT))}
            disabled={!hasBack}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">
            {Math.floor(skip / LIMIT) + 1} / {Math.ceil(totalRecords / LIMIT)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSkip((s) => s + LIMIT)}
            disabled={!hasNext}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      {formOpen && (
        <WisdomFormDialog
          key={editingWisdom?.id ?? "new"}
          editing={editingWisdom}
          onClose={() => {
            setFormOpen(false);
            setEditingWisdom(null);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditingWisdom(null);
            refetchAll();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">حذف الحكمة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف هذه الحكمة؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="p-4 h-11"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
              className="p-4 h-11"
            >
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">حذف الحكم المحددة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف {selectedIds.size} حكمة؟ لا يمكن التراجع عن هذا
            الإجراء.
          </p>
          {bulkDeleteError && (
            <p className="text-sm text-red-500">{bulkDeleteError}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              className="p-4 h-11"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
              className="p-4 h-11"
            >
              {bulkDeleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
