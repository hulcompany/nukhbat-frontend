"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { getSchoolSubscriptionKeys } from "@/api/subscription-keys";
import { SchoolSubscriptionKey } from "@/types/subscription-key";
import { ApiError } from "@/lib/errors";

const PAGE_SIZE = 10;

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function formatDate(iso: string): string {
  return iso.split("T")[0];
}

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

export default function Keys() {
  const [keys, setKeys] = useState<SchoolSubscriptionKey[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  function fetchKeys() {
    setLoading(true);
    setError(null);
    getSchoolSubscriptionKeys({ skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then((res) => {
        setKeys(res.data.list);
        setTotalRecords(res.data.totalRecords);
      })
      .catch((e) => setError(formatError(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          مفاتيح التفعيل والاشتراكات
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {totalRecords} مفتاح خاص بمدرستك
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin ml-2" />
          جارٍ التحميل...
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={fetchKeys} />}

      {!loading && !error && keys.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد مفاتيح لمدرستك بعد
        </p>
      )}

      {/* Table Card */}
      {!loading && !error && keys.length > 0 && (
        <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">رمز المفتاح</th>
                  <th className="px-6 py-4 text-center">المسار</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                  <th className="px-6 py-4 text-center">الطالب</th>
                  <th className="px-6 py-4 text-center">تاريخ الانتهاء</th>
                  <th className="px-6 py-4 text-center">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {keys.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Key Code */}
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

                    {/* Track */}
                    <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap">
                      {row.track?.name ?? "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {row.usedById ? (
                        row.usedBy?.isExpired ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-rose-100 text-rose-600 border-rose-200">
                            منتهي
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-600 border-blue-200">
                            مستخدم
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-600 border-emerald-200">
                          غير مستخدم
                        </span>
                      )}
                    </td>

                    {/* Student */}
                    <td className="px-6 py-4 text-center text-slate-700 whitespace-nowrap">
                      {row.usedBy?.studentProfile?.user?.name ?? "—"}
                    </td>

                    {/* Expire Date */}
                    <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                      {row.usedBy ? formatDate(row.usedBy.expireDate) : "—"}
                    </td>

                    {/* Creation Date */}
                    <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                      {formatDate(row.createdAt)}
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
            صفحة {page + 1} من {Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))}
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
  );
}
