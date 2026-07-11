"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, FileText, Edit2, Trash2, Download } from "lucide-react";
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
import { getMyBooks, createBook, updateBook, deleteBook } from "@/api/books";
import { downloadFile } from "@/api/files";
import { Book } from "@/types/book";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // PDF viewer
  const [viewerBook, setViewerBook] = useState<Book | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  async function fetchBooks() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyBooks();
      setBooks(res.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function selectPdf(file: File | null) {
    if (file && file.type !== "application/pdf") {
      setFormError("يُقبل فقط ملفات PDF");
      return;
    }
    setFormError(null);
    setPdfFile(file);
    if (!file && fileRef.current) fileRef.current.value = "";
  }

  function openAddDialog() {
    setEditingBook(null);
    selectPdf(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEditDialog(book: Book) {
    setEditingBook(book);
    selectPdf(null);
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const name = nameRef.current!.value.trim();

    if (!editingBook && !pdfFile) {
      setFormError("يرجى اختيار ملف PDF");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingBook) {
        const payload: { name?: string; attachment?: File } = {};
        if (name && name !== editingBook.name) payload.name = name;
        if (pdfFile) payload.attachment = pdfFile;

        if (Object.keys(payload).length > 0) {
          await updateBook(editingBook.id, payload);
        }
      } else {
        await createBook({ name, attachment: pdfFile! });
      }

      setDialogOpen(false);
      selectPdf(null);
      fetchBooks();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(book: Book) {
    setDeletingId(book.id);
    try {
      await deleteBook(book.id);
      setBooks((list) => list.filter((b) => b.id !== book.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  // Load the PDF blob when the viewer opens
  useEffect(() => {
    if (!viewerBook) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    setViewerLoading(true);
    setViewerError(null);
    setViewerUrl(null);

    downloadFile(viewerBook.attachment)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setViewerUrl(objectUrl);
      })
      .catch((e) => {
        if (!cancelled) setViewerError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setViewerLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewerBook]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">الكتب</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة كتب المدرسة بصيغة PDF
          </p>
        </div>
        <Button
          className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={openAddDialog}
        >
          <Plus size={16} /> إضافة كتاب
        </Button>
      </div>

      {/* States */}
      {error && !loading && <ErrorState message={error} onRetry={fetchBooks} />}

      {/* Skeleton */}
      {loading && <HorizontalCardSkeleton />}

      {/* Books Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.length === 0 && (
            <EmptyState
              icon={FileText}
              title="لا توجد كتب بعد"
              description="ابدأ ببناء مكتبة مدرستك بإضافة أول كتاب PDF"
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
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold truncate">{book.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ملف PDF</p>
                </div>
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => openEditDialog(book)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === book.id}
                    onClick={() => handleDelete(book)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-6">
              {editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="book-name">اسم الكتاب</Label>
              <Input
                id="book-name"
                ref={nameRef}
                defaultValue={editingBook?.name ?? ""}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="book-file">
                ملف الكتاب
                {editingBook && (
                  <span className="text-xs text-slate-400 mr-1">
                    (اتركه فارغاً للإبقاء على الملف الحالي)
                  </span>
                )}
              </Label>
              <input
                id="book-file"
                type="file"
                accept="application/pdf"
                ref={fileRef}
                className="hidden"
                onChange={(e) => selectPdf(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  selectPdf(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "bg-blue-50 border-blue-400"
                    : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                }`}
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-red-500" />
                </div>
                {pdfFile ? (
                  <>
                    <p className="text-sm font-bold text-slate-900">
                      {pdfFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPdf(null);
                      }}
                      className="text-xs text-red-500 hover:text-red-600 mt-1"
                    >
                      إزالة الملف
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900">
                      اسحب ملف PDF هنا
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      أو انقر لاختيار ملف · يُقبل فقط ملفات PDF
                    </p>
                  </>
                )}
              </div>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="h-11 px-7"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="h-11 px-7">
                {submitting ? "جاري الحفظ..." : editingBook ? "حفظ" : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={!!viewerBook}
        onOpenChange={(open) => !open && setViewerBook(null)}
      >
        <DialogContent dir="rtl" className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="pt-6 flex items-center justify-between gap-3">
              <span className="truncate">{viewerBook?.name}</span>
              {viewerUrl && viewerBook && (
                <a href={viewerUrl} download={`${viewerBook.name}.pdf`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> تحميل
                  </Button>
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {viewerLoading && (
              <p className="text-center text-slate-500 py-24">
                جاري تحميل الملف...
              </p>
            )}
            {!viewerLoading && viewerError && (
              <p className="text-center text-red-500 py-24">{viewerError}</p>
            )}
            {!viewerLoading && viewerUrl && (
              <iframe
                src={viewerUrl}
                title={viewerBook?.name}
                className="w-full h-[70vh] rounded-lg border border-slate-200"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
