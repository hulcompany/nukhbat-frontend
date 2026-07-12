"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudents, getStudentById } from "@/api/students";
import { getTracks } from "@/api/tracks";
import { getSchools } from "@/api/schools";
import { SchoolStudent } from "@/types/student";
import { Track } from "@/types/track";
import { School } from "@/types/school";

const LIMIT = 10;

const selectClassName =
  "h-12 rounded-lg border border-slate-200 bg-slate-100/50 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200 min-w-40";

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
    getStudentById(studentId)
      .then((res) => setStudent(res.data))
      .catch((e) => setError((e as Error).message))
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
              {student.school.owner && (
                <DetailRow
                  label="مالك المدرسة"
                  value={student.school.owner.name}
                />
              )}
              <DetailRow
                label="تاريخ التسجيل"
                value={new Date(student.createdAt).toLocaleDateString("ar-SA")}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Students() {
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasBack, setHasBack] = useState(false);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [nameInput, setNameInput] = useState("");
  const [name, setName] = useState("");
  const [trackId, setTrackId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");

  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
    getSchools({ limit: 100 })
      .then((res) => setSchools(res.data.list))
      .catch(() => setSchools([]));
  }, []);

  function handleSearch(e: React.SubmitEvent) {
    e.preventDefault();
    setSkip(0);
    setName(nameInput.trim());
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStudents({
      skip,
      limit: LIMIT,
      sort,
      ...(name ? { name } : {}),
      ...(trackId ? { trackId } : {}),
      ...(schoolId ? { schoolId } : {}),
    })
      .then((res) => {
        if (cancelled) return;
        setStudents(res.data.list);
        setTotalRecords(res.data.totalRecords);
        setHasNext(res.data.next);
        setHasBack(res.data.back);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skip, name, trackId, schoolId, sort]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة الطلاب</h1>
        {loading ? (
          <Skeleton className="h-4 w-40 mt-1" />
        ) : (
          <p className="text-sm text-slate-500 mt-1">
            {totalRecords} طالب مسجل في المنصة
          </p>
        )}
      </div>

      {/* Filters Card */}
      <Card className="p-2 border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            {/* Name Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
              <Input
                placeholder="بحث بالاسم..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full pr-9 focus-visible:ring-blue-600"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 min-w-24"
            >
              بحث
            </Button>
            {/* Sort Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSkip(0);
                setSort((s) => (s === "DESC" ? "ASC" : "DESC"));
              }}
              className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 min-w-36"
            >
              <ArrowUpDown className="ml-2 h-4 w-4" />
              {sort === "DESC" ? "الأحدث أولاً" : "الأقدم أولاً"}
            </Button>
          </form>

          {/* Track & School Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <select
              className={selectClassName}
              value={trackId}
              onChange={(e) => {
                setTrackId(e.target.value);
                setSkip(0);
              }}
            >
              <option value="">كل المسارات</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={schoolId}
              onChange={(e) => {
                setSchoolId(e.target.value);
                setSkip(0);
              }}
            >
              <option value="">كل المدارس</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">الطالب</th>
                <th className="px-6 py-4 text-center">رقم الهاتف</th>
                <th className="px-6 py-4 text-center">المدرسة</th>
                <th className="px-6 py-4 text-center">المسار</th>
                <th className="px-6 py-4 text-center">التفعيل</th>
                <th className="px-6 py-4 text-center">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                      </td>
                    ))}
                    <td className="px-6 py-3">
                      <Skeleton className="h-6 w-16 mx-auto" />
                    </td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-red-500">{error}</p>
                  </td>
                </tr>
              )}

              {!loading && !error && students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-slate-400">لا يوجد طلاب مسجلون</p>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                students.map((student) => (
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

                    {/* School */}
                    <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                      {student.school.name}
                    </td>

                    {/* Track */}
                    <td className="px-6 py-3 text-center text-slate-600 whitespace-nowrap">
                      {student.track.name}
                    </td>

                    {/* Activation Badge */}
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <ActivationBadge active={student.active} />
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-3 text-center text-slate-500 whitespace-nowrap">
                      {new Date(student.createdAt).toLocaleDateString("ar-SA")}
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
