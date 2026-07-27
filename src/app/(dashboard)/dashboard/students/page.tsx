"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Ban, Unlock, Loader2, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTracks } from "@/api/tracks";
import {
  getSchoolStudents,
  getSchoolStudentById,
  setStudentActivation,
} from "@/api/students";
import { Track } from "@/types/track";
import { SchoolStudent } from "@/types/student";
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

function ActivationBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        active
          ? "bg-emerald-100 text-emerald-600 border-emerald-200"
          : "bg-rose-100 text-rose-600 border-rose-200"
      }`}
    >
      {active ? "مفعل" : "غير مفعل"}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-left break-all">
        {value}
      </span>
    </div>
  );
}

function StudentDetailsDialog({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [student, setStudent] = useState<SchoolStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSchoolStudentById(studentId)
      .then((res) => setStudent(res.data))
      .catch((e) => setError(formatError(e)))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pt-5">تفاصيل الطالب</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={24} className="animate-spin ml-2" />
            جارٍ التحميل...
          </div>
        )}

        {!loading && error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && student && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                {student.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{student.user.name}</p>
                <ActivationBadge active={student.active} />
              </div>
            </div>

            <div className="space-y-2">
              <DetailRow label="البريد الإلكتروني" value={student.user.email} />
              <DetailRow
                label="رقم الهاتف"
                value={student.user.phoneNumber || "—"}
              />
              <DetailRow
                label="البريد موثق"
                value={student.user.emailVerfied ? "نعم" : "لا"}
              />
              <DetailRow label="المسار" value={student.track.name} />
              <DetailRow label="المدرسة" value={student.school.name} />
              <DetailRow
                label="تاريخ التسجيل"
                value={formatDate(student.createdAt)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Students() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(0);

  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  function fetchStudents() {
    setLoading(true);
    setError(null);
    getSchoolStudents({
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort,
      ...(trackId ? { trackId } : {}),
      ...(debouncedSearch ? { name: debouncedSearch } : {}),
    })
      .then((res) => {
        setStudents(res.data.list);
        setTotalRecords(res.data.totalRecords);
      })
      .catch((e) => setError(formatError(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, trackId, debouncedSearch]);

  async function toggleActivation(student: SchoolStudent) {
    setTogglingId(student.id);
    setActionError(null);
    try {
      const res = await setStudentActivation(student.id, !student.active);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, active: res.data.active } : s,
        ),
      );
    } catch (e) {
      setActionError(formatError(e));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة الطلاب</h1>
        <p className="text-sm text-slate-500 mt-1">
          {totalRecords} طالب مسجل في المنصة
        </p>
      </div>

      {/* Filters Card */}
      <Card className="p-2 border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="بحث بالاسم..."
                className="w-full pr-9 h-12 focus-visible:ring-blue-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Sort */}
            <select
              className="h-12 rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200 min-w-36"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as "ASC" | "DESC");
                setPage(0);
              }}
            >
              <option value="DESC">الأحدث أولاً</option>
              <option value="ASC">الأقدم أولاً</option>
            </select>
          </div>

          {/* Track Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => {
                setTrackId("");
                setPage(0);
              }}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trackId === ""
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل
            </button>
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  setTrackId(track.id);
                  setPage(0);
                }}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  trackId === track.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {actionError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
          <button onClick={() => setActionError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin ml-2" />
          جارٍ التحميل...
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchStudents} />
      )}

      {!loading && !error && students.length === 0 && (
        <EmptyState
          icon={Users}
          title="لا يوجد طلاب"
          description={
            debouncedSearch || trackId
              ? "لم يتم العثور على طلاب يطابقون معايير البحث المحددة."
              : "لم يتم تسجيل أي طالب في المنصة بعد."
          }
        />
      )}

      {/* Table Card */}
      {!loading && !error && students.length > 0 && (
        <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">الطالب</th>
                  <th className="px-6 py-4 text-center">رقم الهاتف</th>
                  <th className="px-6 py-4 text-center">المسار</th>
                  <th className="px-6 py-4 text-center">التفعيل</th>
                  <th className="px-6 py-4 text-center">تاريخ التسجيل</th>
                  <th className="px-6 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {student.user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {student.user.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {student.user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                      <span dir="ltr">{student.user.phoneNumber || "—"}</span>
                    </td>

                    {/* Track */}
                    <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                      {student.track.name}
                    </td>

                    {/* Activation Badge */}
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <ActivationBadge active={student.active} />
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-3 text-center text-slate-500 whitespace-nowrap">
                      {formatDate(student.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض"
                          onClick={() => setViewingId(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {student.active ? (
                          <button
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="إلغاء التفعيل"
                            disabled={togglingId === student.id}
                            onClick={() => toggleActivation(student)}
                          >
                            {togglingId === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                            title="تفعيل"
                            disabled={togglingId === student.id}
                            onClick={() => toggleActivation(student)}
                          >
                            {togglingId === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && totalRecords > 0 && (
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

      {/* Student Details Dialog */}
      {viewingId && (
        <StudentDetailsDialog
          studentId={viewingId}
          onClose={() => setViewingId(null)}
        />
      )}
    </div>
  );
}
