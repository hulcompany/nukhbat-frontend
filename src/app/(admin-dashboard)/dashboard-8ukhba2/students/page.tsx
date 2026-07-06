"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Ban,
  Send,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Mail,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsers } from "@/api/user";
import { UserListItem } from "@/types/user";

// Helper function to render colored badges based on text value
const getBadgeStyles = (text: string) => {
  switch (text) {
    case "مفعل":
    case "مكتمل":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "غير مفعل":
    case "غير مكتمل":
      return "bg-amber-100 text-amber-600 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

function Badge({ text }: { text: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles(
        text,
      )}`}
    >
      {text}
    </span>
  );
}

const LIMIT = 10;

export default function Students() {
  const [students, setStudents] = useState<UserListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasBack, setHasBack] = useState(false);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");

  function handleSearch(e: React.SubmitEvent) {
    e.preventDefault();
    setSkip(0);
    setName(nameInput.trim());
    setEmail(emailInput.trim());
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUsers({
      skip,
      limit: LIMIT,
      sort,
      role: "student",
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
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
  }, [skip, name, email, sort]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-10">
          <p className="">إضافة طالب</p>
          <Plus className="ml-2 h-4 w-4" />
        </Button>
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
            {/* Email Search Input */}
            <div className="relative flex-1">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
              <Input
                placeholder="بحث بالبريد الإلكتروني..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">الطالب</th>
                <th className="px-6 py-4 text-center">تفعيل البريد</th>
                <th className="px-6 py-4 text-center">اكتمال الملف</th>
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
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                      </td>
                    ))}
                    <td className="px-6 py-3">
                      <Skeleton className="h-6 w-28 mx-auto" />
                    </td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-red-500">{error}</p>
                  </td>
                </tr>
              )}

              {!loading && !error && students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
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
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email Verified Badge */}
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <Badge
                        text={student.emailVerfied ? "مفعل" : "غير مفعل"}
                      />
                    </td>

                    {/* Profile Completed Badge */}
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <Badge
                        text={student.isCompleted ? "مكتمل" : "غير مكتمل"}
                      />
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
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حظر"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="إرسال رسالة"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="تعديل التواريخ"
                        >
                          <Calendar className="h-4 w-4" />
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
    </div>
  );
}
