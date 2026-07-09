"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  ChevronRight,
  ChevronLeft,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSubscriptionKeys,
  createSubscriptionKeys,
  deleteSubscriptionKey,
  bulkDeleteSubscriptionKeys,
} from "@/api/subscription-keys";
import { getSubscriptions } from "@/api/subscriptions";
import { getTracks } from "@/api/tracks";
import { getSchools } from "@/api/schools";
import {
  SubscriptionKey,
  CreatedSubscriptionKey,
} from "@/types/subscription-key";
import { Subscription } from "@/types/subscription";
import { Track } from "@/types/track";
import { School } from "@/types/school";
import { ApiError } from "@/lib/errors";

const LIMIT = 10;

const selectClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-100/50 px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200";

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA");
}

const subscriptionTypeLabels: Record<string, string> = {
  paid: "مدفوع",
  key: "مفتاح",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      className="text-slate-400 hover:text-blue-600 transition-colors"
      title="نسخ"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

function CreateKeysDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [trackId, setTrackId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [count, setCount] = useState("5");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdKeys, setCreatedKeys] = useState<
    CreatedSubscriptionKey[] | null
  >(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    setOptionsLoading(true);
    Promise.all([getTracks(), getSchools({ skip: 0, limit: 100 })])
      .then(([tracksRes, schoolsRes]) => {
        setTracks(tracksRes.data);
        setSchools(schoolsRes.data.list);
      })
      .catch((e) => setFormError(formatError(e)))
      .finally(() => setOptionsLoading(false));
  }, []);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const parsedCount = Number(count);
    if (
      !trackId ||
      !schoolId ||
      !Number.isInteger(parsedCount) ||
      parsedCount < 1
    ) {
      setFormError("يرجى اختيار المسار والمدرسة وإدخال عدد صحيح للمفاتيح");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await createSubscriptionKeys({
        trackId,
        schoolId,
        count: parsedCount,
      });
      setCreatedKeys(res.data);
      onCreated();
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyAll() {
    if (!createdKeys) return;
    await navigator.clipboard.writeText(
      createdKeys.map((k) => k.key).join("\n"),
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="pt-5">
            {createdKeys ? "المفاتيح المنشأة" : "إنشاء مفاتيح جديدة"}
          </DialogTitle>
        </DialogHeader>

        {createdKeys ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-500">
              تم إنشاء {createdKeys.length} مفتاح بنجاح. انسخ المفاتيح الآن.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-3">
              {createdKeys.map((k) => (
                <div
                  key={k.key}
                  className="flex items-center justify-between gap-2"
                >
                  <span
                    className="font-mono text-sm text-slate-700 bg-gray-100 p-1 rounded-sm"
                    dir="ltr"
                  >
                    {k.key}
                  </span>
                  <CopyButton value={k.key} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyAll}
                className="p-4 h-11"
              >
                {copiedAll ? "تم النسخ" : "نسخ الكل"}
              </Button>
              <Button type="button" onClick={onClose} className="p-4 h-11">
                إغلاق
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-3">
              <Label htmlFor="key-track">المسار</Label>
              <select
                id="key-track"
                className={selectClassName}
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                disabled={optionsLoading}
                required
              >
                <option value="">
                  {optionsLoading ? "جارٍ التحميل..." : "اختر المسار"}
                </option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="key-school">المدرسة</Label>
              <select
                id="key-school"
                className={selectClassName}
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                disabled={optionsLoading}
                required
              >
                <option value="">
                  {optionsLoading ? "جارٍ التحميل..." : "اختر المدرسة"}
                </option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="key-count">عدد المفاتيح</Label>
              <Input
                id="key-count"
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
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
                {submitting ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function KeysPage() {
  const [tab, setTab] = useState<"keys" | "subscriptions">("keys");

  const [keys, setKeys] = useState<SubscriptionKey[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasBack, setHasBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionKey | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsTotalRecords, setSubsTotalRecords] = useState(0);
  const [subsHasNext, setSubsHasNext] = useState(false);
  const [subsHasBack, setSubsHasBack] = useState(false);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [subsSkip, setSubsSkip] = useState(0);

  function fetchKeys() {
    setLoading(true);
    setError(null);
    getSubscriptionKeys({ skip, limit: LIMIT })
      .then((res) => {
        setKeys(res.data.list);
        setTotalRecords(res.data.totalRecords);
        setHasNext(res.data.next);
        setHasBack(res.data.back);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  function fetchSubscriptions() {
    setSubsLoading(true);
    setSubsError(null);
    getSubscriptions({ skip: subsSkip, limit: LIMIT })
      .then((res) => {
        setSubscriptions(res.data.list);
        setSubsTotalRecords(res.data.totalRecords);
        setSubsHasNext(res.data.next);
        setSubsHasBack(res.data.back);
      })
      .catch((e) => setSubsError((e as Error).message))
      .finally(() => setSubsLoading(false));
  }

  useEffect(() => {
    if (tab === "subscriptions") fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, subsSkip]);

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

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === keys.length ? new Set() : new Set(keys.map((k) => k.id)),
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSubscriptionKey(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      fetchKeys();
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
      await bulkDeleteSubscriptionKeys(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      fetchKeys();
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
          <h1 className="text-2xl font-bold text-slate-900">
            مفاتيح التفعيل والاشتراكات
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {tab === "keys"
              ? `${totalRecords} مفتاح في النظام`
              : `${subsTotalRecords} اشتراك في النظام`}
          </p>
        </div>
        <ActionButton
          label="إنشاء مفاتيح"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          onClick={() => setCreateOpen(true)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(
          [
            { value: "keys", label: "المفاتيح" },
            { value: "subscriptions", label: "الاشتراكات" },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bulk Selection Bar */}
      {tab === "keys" && !loading && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm text-red-700 font-medium">
            تم تحديد {selectedIds.size} مفتاح
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

      {/* Keys Table */}
      {tab === "keys" && (
        <>
          <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-center whitespace-nowrap w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        checked={
                          keys.length > 0 && selectedIds.size === keys.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap">رمز المفتاح</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      المسار
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      المدرسة
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      الطالب
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      تاريخ الإنشاء
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
                          <Skeleton className="h-4 w-52" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </td>
                      </tr>
                    ))}

                  {!loading && error && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  )}

                  {!loading && !error && keys.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-slate-400"
                      >
                        لا توجد مفاتيح منشأة بعد
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !error &&
                    keys.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-blue-600"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleSelect(row.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-slate-700 bg-gray-100 p-1 rounded-sm"
                              dir="ltr"
                            >
                              {row.key}
                            </span>
                            <CopyButton value={row.key} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                          {row.track?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                          {row.school?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              row.usedById
                                ? "bg-blue-100 text-blue-600 border-blue-200"
                                : "bg-emerald-100 text-emerald-600 border-emerald-200"
                            }`}
                          >
                            {row.usedById ? "مستخدم" : "غير مستخدم"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700 whitespace-nowrap">
                          {row.usedBy?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
                              title="حذف"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteTarget(row);
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
                {Math.floor(skip / LIMIT) + 1} /{" "}
                {Math.ceil(totalRecords / LIMIT)}
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
        </>
      )}

      {/* Subscriptions Table */}
      {tab === "subscriptions" && (
        <>
          <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">الطالب</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      رقم الهاتف
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      النوع
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      تاريخ الاشتراك
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      تاريخ الانتهاء
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {subsLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-40 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-28 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                        </td>
                      </tr>
                    ))}

                  {!subsLoading && subsError && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-red-500"
                      >
                        {subsError}
                      </td>
                    </tr>
                  )}

                  {!subsLoading && !subsError && subscriptions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-400"
                      >
                        لا توجد اشتراكات بعد
                      </td>
                    </tr>
                  )}

                  {!subsLoading &&
                    !subsError &&
                    subscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">
                          {sub.studentProfile?.user?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                          {sub.studentProfile?.user?.email ?? "—"}
                        </td>
                        <td
                          className="px-6 py-4 text-center text-slate-600 whitespace-nowrap"
                          dir="ltr"
                        >
                          {sub.studentProfile?.user?.phoneNumber ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-purple-100 text-purple-600 border-purple-200">
                            {subscriptionTypeLabels[sub.type] ?? sub.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                          {formatDate(sub.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                          {formatDate(sub.expireDate)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              sub.isExpired
                                ? "bg-rose-100 text-rose-600 border-rose-200"
                                : "bg-emerald-100 text-emerald-600 border-emerald-200"
                            }`}
                          >
                            {sub.isExpired ? "منتهي" : "نشط"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Subscriptions Pagination */}
          {!subsLoading && !subsError && subsTotalRecords > LIMIT && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubsSkip((s) => Math.max(0, s - LIMIT))}
                disabled={!subsHasBack}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-500">
                {Math.floor(subsSkip / LIMIT) + 1} /{" "}
                {Math.ceil(subsTotalRecords / LIMIT)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubsSkip((s) => s + LIMIT)}
                disabled={!subsHasNext}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Keys Dialog */}
      {createOpen && (
        <CreateKeysDialog
          onClose={() => setCreateOpen(false)}
          onCreated={fetchKeys}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">حذف المفتاح</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف المفتاح{" "}
            <span className="font-mono" dir="ltr">
              {deleteTarget?.key}
            </span>
            ؟ لا يمكن التراجع عن هذا الإجراء.
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
            <DialogTitle className="pt-5">حذف المفاتيح المحددة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف {selectedIds.size} مفتاح؟ لا يمكن التراجع عن هذا
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
