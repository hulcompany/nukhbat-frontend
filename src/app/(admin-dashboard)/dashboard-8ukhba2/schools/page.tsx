"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Key,
  Send,
  FileText,
  Building2,
  Search,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getSchools, createSchool, GetSchoolsParams } from "@/api/schools";
import { downloadFile } from "@/api/files";
import { sendNotification } from "@/api/notifications";
import { School } from "@/types/school";

function FileImage({
  fileId,
  alt,
  className,
}: {
  fileId: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;
    downloadFile(fileId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

// --- Notification Dialog Component ---
// --- Notification Dialog Component ---
function SchoolNotificationDialog({
  schoolId,
  onClose,
}: {
  schoolId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if both title and description are provided
    if (!title.trim() || !description.trim()) {
      setError("العنوان والتفاصيل مطلوبان");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendNotification({
        title: title.trim(),
        description: description.trim(), // Now guaranteed to have a value
        userId: schoolId,
      });

      setSuccess(true);
      // Auto-close dialog after 1.5 seconds of showing success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || "حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir="rtl"
        className="max-w-md max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="pt-5">إرسال إشعار للمدرسة</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Send size={24} />
            </div>
            <p className="text-lg font-medium text-green-600 text-center">
              تم إرسال الإشعار بنجاح!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                عنوان الإشعار <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الإشعار..."
                disabled={loading}
                required
                className="focus-visible:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                تفاصيل الإشعار <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل محتوى الإشعار..."
                disabled={loading}
                required
                className="w-full h-28 rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 resize-none transition-shadow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-11"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                // Disable button if either field is empty
                disabled={loading || !title.trim() || !description.trim()}
                className="bg-blue-600 hover:bg-blue-700 h-11 text-white min-w-24"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-2" />
                )}
                إرسال
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
// ---------------------------------------------

const LIMIT = 10;

export default function SchoolsManagementPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifySchoolId, setNotifySchoolId] = useState<string | null>(null); // State for the notification dialog
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schoolNameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectLogo(file: File | null) {
    if (file && !file.type.startsWith("image/")) return;
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setLogoFile(file);
    if (!file && imageRef.current) imageRef.current.value = "";
  }

  async function fetchSchools(params: GetSchoolsParams) {
    setLoading(true);
    setError(null);
    try {
      const res = await getSchools(params);
      setSchools(res.data.list);
      setTotalRecords(res.data.totalRecords);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchools({ skip, limit: LIMIT, ...(search ? { name: search } : {}) });
  }, [skip, search]);

  function handleSearch(e: React.SubmitEvent) {
    e.preventDefault();
    setSkip(0);
    setSearch(searchInput);
  }

  async function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    if (!logoFile) {
      setFormError("يرجى اختيار صورة");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await createSchool({
        schoolName: schoolNameRef.current!.value,
        name: nameRef.current!.value,
        email: emailRef.current!.value,
        password: passwordRef.current!.value,
        image: logoFile,
      });
      setDialogOpen(false);
      selectLogo(null);
      fetchSchools({ skip, limit: LIMIT, ...(search ? { name: search } : {}) });
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">إدارة المدارس</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة اشتراكات المدارس والعقود المؤسسية
          </p>
        </div>
        <ActionButton
          label="إضافة مدرسة"
          icon={Plus}
          bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full sm:w-auto"
          onClick={() => setDialogOpen(true)}
        />
      </div>

      {/* Search */}
      <Card className="p-2 border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
              <Input
                placeholder="البحث باسم المدرسة..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-0">
          <CardContent className="p-4 md:p-6 text-center">
            {loading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                {totalRecords}
              </div>
            )}
            <div className="text-xs md:text-sm text-slate-500">
              إجمالي المدارس
            </div>
          </CardContent>
        </Card>
      </div>

      {/* States */}
      {error && <p className="text-center text-red-500 py-12">{error}</p>}

      {/* Schools Grid Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-3 md:gap-4 items-center mb-6">
                  <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-slate-50 p-2 md:p-3 rounded-lg space-y-1.5"
                    >
                      <Skeleton className="h-2.5 w-16" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:flex gap-2">
                  {Array.from({ length: 4 }).map((_, k) => (
                    <Skeleton
                      key={k}
                      className="flex-1 h-9 md:h-10 rounded-md"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schools Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {schools.length === 0 && (
            <p className="text-center text-slate-400 col-span-2 py-12">
              لا توجد مدارس مسجلة
            </p>
          )}
          {schools.map((school) => (
            <Card
              key={school.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
              onClick={() =>
                router.push(`/dashboard-8ukhba2/school/${school.id}`)
              }
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 md:gap-4 items-center">
                    {school.logo ? (
                      <FileImage
                        fileId={school.logo}
                        alt={school.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Building2 className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base md:text-lg leading-tight">
                        {school.name}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                        {school.owner.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                  {[
                    { label: "المالك", val: school.owner.name },
                    { label: "البريد الإلكتروني", val: school.owner.email },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-2 md:p-3 rounded-lg">
                      <div className="text-[10px] md:text-xs text-slate-400 mb-0.5 md:mb-1">
                        {item.label}
                      </div>
                      <div className="text-xs md:text-sm font-semibold truncate">
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="grid grid-cols-2 sm:flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-blue-100 text-blue-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-blue-200"
                    onClick={() =>
                      router.push(
                        `/dashboard-8ukhba2/school/${school.id}?edit=true`,
                      )
                    }
                  >
                    <Edit2 size={16} className="shrink-0" /> تعديل
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-purple-100 text-purple-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-purple-200"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering the Card's onClick (navigation)
                      // Pass the appropriate ID based on your backend expectation. Using school.id here.
                      setNotifySchoolId(school.id);
                    }}
                  >
                    <Send size={16} className="shrink-0" /> إشعار
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalRecords > LIMIT && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSkip((s) => Math.max(0, s - LIMIT))}
            disabled={skip === 0}
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
            disabled={skip + LIMIT >= totalRecords}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create School Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-6">إضافة مدرسة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="schoolName">اسم المدرسة</Label>
              <Input id="schoolName" ref={schoolNameRef} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">اسم المسؤول</Label>
              <Input id="name" ref={nameRef} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" ref={emailRef} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" ref={passwordRef} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="image">شعار المدرسة</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                ref={imageRef}
                className="hidden"
                onChange={(e) => selectLogo(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => imageRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  selectLogo(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "bg-blue-50 border-blue-400"
                    : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                }`}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="شعار المدرسة"
                    className="w-16 h-16 rounded-xl object-cover mb-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                {logoFile ? (
                  <>
                    <p className="text-sm font-bold text-slate-900">
                      {logoFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectLogo(null);
                      }}
                      className="text-xs text-red-500 hover:text-red-600 mt-1"
                    >
                      إزالة الصورة
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900">
                      اسحب الصورة هنا
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      أو انقر لاختيار صورة
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
                className="p-4 h-11"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="p-4 h-11">
                {submitting ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* School Notification Dialog */}
      {notifySchoolId && (
        <SchoolNotificationDialog
          schoolId={notifySchoolId}
          onClose={() => setNotifySchoolId(null)}
        />
      )}
    </div>
  );
}
