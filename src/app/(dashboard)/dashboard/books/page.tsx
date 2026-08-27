"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Bold,
  Italic,
  Heading,
  Eye,
  PenLine,
  Sigma,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HorizontalCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

// API Imports
import { getMyBooks, createBook, updateBook, deleteBook } from "@/api/books";
import { getTracks } from "@/api/tracks";
import { getSchoolCourses } from "@/api/courses";
import { getUnitLessons } from "@/api/lesson";
import { Track } from "@/types/track";
import { Subject } from "@/types/courses";
import { Book } from "@/types/book";
import { ApiError } from "@/lib/errors";

import "katex/dist/katex.min.css";
import katex from "katex";
import { Unit } from "@/types/unit";
import { Lesson } from "@/types/lesson";
import { getCourseUnits } from "@/api/unit";

if (typeof window !== "undefined") {
  (window as any).katex = katex;
}

function DisplayText({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  if (!value) return null;

  return (
    <div
      className={`whitespace-pre-wrap leading-relaxed [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:mb-2 [&_ul]:list-inside [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:list-inside [&_ol]:list-decimal [&_strong]:font-bold [&_em]:italic ${className}`}
      dir="auto"
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {value}
      </ReactMarkdown>
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  // Add / Edit dialog
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Curriculum Selectors States
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const [changeLessonMode, setChangeLessonMode] = useState(false);

  // Delete dialog
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Viewer Dialog (Text Reader instead of PDF)
  const [viewerBook, setViewerBook] = useState<Book | null>(null);

  async function fetchBooks() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyBooks();
      setBooks(res.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- Curriculum Cascading Effects ---
  useEffect(() => {
    if (showForm) {
      getTracks()
        .then((res) => setTracks(res.data))
        .catch(() => setTracks([]));
    }
  }, [showForm]);

  useEffect(() => {
    if (!trackId) {
      setCourses([]);
      return;
    }
    setCoursesLoading(true);
    getSchoolCourses(trackId)
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [trackId]);

  useEffect(() => {
    if (!courseId) {
      setUnits([]);
      return;
    }
    setUnitsLoading(true);
    getCourseUnits(courseId)
      .then((res) => setUnits(res.data))
      .catch(() => setUnits([]))
      .finally(() => setUnitsLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (!unitId) {
      setLessons([]);
      return;
    }
    setLessonsLoading(true);
    getUnitLessons(unitId)
      .then((res) => setLessons(res.data))
      .catch(() => setLessons([]))
      .finally(() => setLessonsLoading(false));
  }, [unitId]);
  // -------------------------------------

  function openAddDialog() {
    setEditingBook(null);
    setName("");
    setText("");
    setLessonId("");
    setTrackId("");
    setCourseId("");
    setUnitId("");
    setChangeLessonMode(true);
    setPreviewMode(false);
    setFormError(null);
    setShowForm(true);
  }

  function openEditDialog(book: Book) {
    setEditingBook(book);
    setName(book.name);
    setText(book.text || "");
    setLessonId(book.lessonId || "");
    setTrackId("");
    setCourseId("");
    setUnitId("");
    setChangeLessonMode(false);
    setPreviewMode(false);
    setFormError(null);
    setShowForm(true);
  }

  function insertMarkdown(prefix: string, suffix: string = "") {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const nextText =
      text.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      text.substring(end);

    setText(nextText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length,
      );
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setFormError("يرجى إدخال اسم الكتاب");
      return;
    }
    if (!text.trim()) {
      setFormError("يرجى إدخال محتوى الكتاب");
      return;
    }
    if (!lessonId.trim()) {
      setFormError("يرجى اختيار الدرس المرتبط بالكتاب");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingBook) {
        // تحديث الكتاب
        const payload: { name?: string; text?: string; lessonId?: string } = {};
        if (name !== editingBook.name) payload.name = name;
        if (text !== editingBook.text) payload.text = text;
        if (lessonId !== editingBook.lessonId) payload.lessonId = lessonId;

        if (Object.keys(payload).length > 0) {
          await updateBook(editingBook.id, payload);
        }
      } else {
        // إضافة كتاب جديد
        await createBook({ name, text, lessonId });
      }

      setShowForm(false);
      setEditingBook(null);
      fetchBooks();
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        setFormError(e.response.data.message);
      } else {
        setFormError(e.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!bookToDelete) return;

    setDeletingId(bookToDelete.id);
    try {
      await deleteBook(bookToDelete.id);
      setBooks((list) => list.filter((b) => b.id !== bookToDelete.id));
      setBookToDelete(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Add / Edit Form (Rich Text Editor) */}
      {showForm ? (
        <div className="w-full min-h-[calc(100vh-100px)]" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {editingBook ? "تعديل محتوى الكتاب" : "كتابة محتوى جديد"}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                {editingBook
                  ? "تعديل بيانات ومحتوى الكتاب"
                  : "إضافة كتاب ومحتوى دراسي جديد"}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
              className="h-11 px-6"
            >
              إلغاء
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Book information */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 md:w-1/2">
                <Label htmlFor="book-name">عنوان الكتاب / الدرس</Label>
                <Input
                  id="book-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل عنوان الكتاب..."
                  required
                  className="h-11"
                />
              </div>

              {/* Lesson Selection Cascading */}
              <div className="space-y-3">
                <Label>الدرس المرتبط بالكتاب</Label>

                {editingBook && !changeLessonMode ? (
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 md:w-1/2">
                    <span className="text-sm font-medium text-slate-700">
                      مُعرّف الدرس الحالي:{" "}
                      <span className="font-mono text-slate-500 ml-1">
                        {lessonId}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeLessonMode(true)}
                    >
                      تغيير الدرس
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">المسار</Label>
                      <select
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        value={trackId}
                        onChange={(e) => {
                          setTrackId(e.target.value);
                          setCourseId("");
                          setUnitId("");
                          setLessonId("");
                        }}
                      >
                        <option value="">اختر المسار...</option>
                        {tracks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">المادة</Label>
                      <select
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={courseId}
                        onChange={(e) => {
                          setCourseId(e.target.value);
                          setUnitId("");
                          setLessonId("");
                        }}
                        disabled={!trackId || coursesLoading}
                      >
                        <option value="">
                          {coursesLoading
                            ? "جارٍ التحميل..."
                            : "اختر المادة..."}
                        </option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">الوحدة</Label>
                      <select
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={unitId}
                        onChange={(e) => {
                          setUnitId(e.target.value);
                          setLessonId("");
                        }}
                        disabled={!courseId || unitsLoading}
                      >
                        <option value="">
                          {unitsLoading ? "جارٍ التحميل..." : "اختر الوحدة..."}
                        </option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">الدرس</Label>
                      <select
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={lessonId}
                        onChange={(e) => setLessonId(e.target.value)}
                        disabled={!unitId || lessonsLoading}
                        required
                      >
                        <option value="">
                          {lessonsLoading ? "جارٍ التحميل..." : "اختر الدرس..."}
                        </option>
                        {lessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {editingBook && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end mt-1 border-t border-slate-200 pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setChangeLessonMode(false);
                            setLessonId(editingBook.lessonId || "");
                          }}
                        >
                          إلغاء التغيير والاحتفاظ بالدرس الحالي
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="book-content">
                  المحتوى النصي (يدعم المعادلات عبر KaTeX)
                </Label>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      !previewMode
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                    }`}
                  >
                    <PenLine className="h-3.5 w-3.5" /> تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      previewMode
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> معاينة
                  </button>
                </div>
              </div>

              {!previewMode ? (
                <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600">
                  <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/80 p-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0 text-slate-600 hover:text-blue-600"
                      onClick={() => insertMarkdown("**", "**")}
                      title="عريض (Bold)"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0 text-slate-600 hover:text-blue-600"
                      onClick={() => insertMarkdown("*", "*")}
                      title="مائل (Italic)"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0 text-slate-600 hover:text-blue-600"
                      onClick={() => insertMarkdown("### ")}
                      title="عنوان (Heading)"
                    >
                      <Heading className="h-4 w-4" />
                    </Button>
                    <div className="mx-1 h-5 w-px shrink-0 bg-slate-300" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 px-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => insertMarkdown("$", "$")}
                      title="معادلة رياضية في نفس السطر"
                    >
                      <span className="font-serif text-[15px] font-bold italic">
                        f(x)
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 px-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => insertMarkdown("\n$$\n", "\n$$\n")}
                      title="معادلة رياضية في سطر منفصل"
                    >
                      <Sigma className="h-4 w-4" />
                    </Button>
                  </div>
                  <textarea
                    id="book-content"
                    ref={contentTextareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="ابدأ في كتابة محتوى الكتاب واستخدم أدوات التنسيق العلوية..."
                    className="h-[calc(100vh-420px)] min-h-[500px] w-full resize-y bg-transparent px-3 py-3 text-sm placeholder:text-right placeholder:text-slate-400 focus:outline-none"
                    dir="auto"
                  />
                </div>
              ) : (
                <div className="min-h-[500px] w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm shadow-inner">
                  {text ? (
                    <DisplayText value={text} />
                  ) : (
                    <span className="italic text-slate-400">
                      لا يوجد محتوى لمعاينته...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {formError && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                {formError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-5 border-t border-slate-200 pb-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingBook(null);
                }}
                className="h-11 px-7"
              >
                إلغاء
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 px-7 bg-blue-600 hover:bg-blue-700 text-white min-w-32"
              >
                {submitting
                  ? "جاري الحفظ..."
                  : editingBook
                    ? "حفظ التعديلات"
                    : "إضافة المحتوى"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">الكتب والمحتوى</h1>
              <p className="text-sm text-slate-500 mt-1">
                إدارة نصوص الكتب المدرسية وإضافة المعادلات الرياضية
              </p>
            </div>
            <Button
              className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={openAddDialog}
            >
              <Plus size={16} /> إضافة كتاب
            </Button>
          </div>
          {/* States */}
          {error && !loading && (
            <ErrorState
              message={error.message}
              status={error instanceof ApiError ? error.status : undefined}
              onRetry={fetchBooks}
            />
          )}

          {/* Skeleton */}
          {loading && <HorizontalCardSkeleton />}

          {/* Books Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="لا توجد كتب بعد"
                  description="ابدأ بكتابة أول محتوى دراسي لديك."
                  actionLabel="إضافة كتاب"
                  onAction={openAddDialog}
                />
              )}
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="p-0 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setViewerBook(book)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold truncate">{book.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        محتوى نصي تفاعلي
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openEditDialog(book)}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === book.id}
                        onClick={() => setBookToDelete(book)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!bookToDelete}
            onOpenChange={(open) => !open && setBookToDelete(null)}
          >
            <DialogContent dir="rtl" className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="pt-6 text-red-600">
                  تأكيد الحذف
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-700 text-sm">
                  هل أنت متأكد من رغبتك في حذف{" "}
                  <span className="font-bold">"{bookToDelete?.name}"</span>؟ لا
                  يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookToDelete(null)}
                  className="h-11 px-7"
                  disabled={!!deletingId}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="h-11 px-7 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!!deletingId}
                >
                  {deletingId ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Text Viewer Dialog (replaces PDF viewer) */}
          <Dialog
            open={!!viewerBook}
            onOpenChange={(open) => !open && setViewerBook(null)}
          >
            <DialogContent
              dir="rtl"
              className="max-w-[90vw] w-[90vw] max-h-[90vh] flex flex-col p-4 md:p-6"
            >
              <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
                <DialogTitle className="pt-2 flex items-center justify-between gap-3 text-xl">
                  <span className="truncate">{viewerBook?.name}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-2 md:p-4">
                <DisplayText
                  value={viewerBook?.text || "لا يوجد محتوى لعرضه."}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
