"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Edit2, ImageIcon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMySchool,
  updateMySchool,
  deleteMySchoolImage,
} from "@/api/schools";
import { downloadFile } from "@/api/files";
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

export default function SchoolProfilePage() {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingImage, setDeletingImage] = useState(false);
  const [deleteImageError, setDeleteImageError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null); // <-- Added phoneRef

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

  async function fetchSchool() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMySchool();
      setSchool(res.data);
      console.log(res.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchool();
  }, []);

  async function handleEdit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!school) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const newName = nameRef.current!.value.trim();

      // --- Phone Number Validation ---
      let phoneVal = phoneRef.current!.value.trim();
      if (phoneVal.startsWith("0")) {
        phoneVal = phoneVal.substring(1); // Strip leading zero
      }

      if (!phoneVal.startsWith("9")) {
        setFormError("رقم الهاتف يجب أن يبدأ بالرقم 9");
        setSubmitting(false);
        return;
      }

      // -------------------------------

      const payload: { name?: string; image?: File } = {};
      if (newName && newName !== school.name) payload.name = newName;
      if (logoFile) payload.image = logoFile;

      if (Object.keys(payload).length === 0) {
        setEditOpen(false);
        setSubmitting(false);
        return;
      }

      const res = await updateMySchool(payload);

      setEditOpen(false);
      selectLogo(null);
      setSchool(res.data);
      window.dispatchEvent(new Event("school-updated"));
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

  async function handleDeleteImage() {
    setDeletingImage(true);
    setDeleteImageError(null);
    try {
      await deleteMySchoolImage();
      setSchool((s) => (s ? { ...s, logo: null } : s));
      window.dispatchEvent(new Event("school-updated"));
    } catch (e) {
      setDeleteImageError((e as Error).message);
    } finally {
      setDeletingImage(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-11 w-24 rounded-lg" />
        </div>

        {/* School Info */}
        <Card className="p-0">
          <CardContent className="p-6 flex gap-6 items-center">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Owner Details */}
        <Card className="p-0">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error ?? "تعذر تحميل بيانات المدرسة"}</p>
        <Button variant="outline" onClick={fetchSchool}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">ملف المدرسة</h1>
          <p className="text-sm text-slate-500 mt-1">بيانات مدرستك الأساسية</p>
        </div>
        <Button className="gap-2 h-11 px-6" onClick={() => setEditOpen(true)}>
          <Edit2 size={16} /> تعديل
        </Button>
      </div>

      {/* School Info */}
      <Card className="p-0">
        <CardContent className="p-6 flex gap-6 items-center">
          {school.logo ? (
            <FileImage
              fileId={school.logo}
              alt={school.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <Building2 className="w-12 h-12" />
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{school.name}</h2>
            <p className="text-sm text-slate-500">
              المالك: {school.owner.name}
            </p>
            <p className="text-sm text-slate-500">{school.owner.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Owner Details */}
      <Card className="p-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-base">معلومات المسؤول</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "الاسم", val: school.owner.name },
              { label: "البريد الإلكتروني", val: school.owner.email },
              {
                label: "رقم الهاتف",
                val: school.phoneNumber || school.owner.phoneNumber || "—",
                dir: "ltr",
              }, // <-- Added Phone Number
              { label: "الدور", val: school.owner.role },
              {
                label: "البريد مُفعَّل",
                val: school.owner.emailVerfied ? "نعم" : "لا",
              },
              {
                label: "تاريخ الإنشاء",
                val: new Date(school.owner.createdAt).toLocaleDateString(
                  "ar-SA",
                ),
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                <div className="text-sm font-semibold" dir={item.dir || "rtl"}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-6">تعديل ملف المدرسة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="edit-name">اسم المدرسة</Label>
              <Input
                id="edit-name"
                ref={nameRef}
                defaultValue={school.name}
                required
              />
            </div>

            {/* --- Phone Number Field --- */}
            {/* <div className="space-y-1">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <div
                className="flex items-center border border-slate-200 rounded-md focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-shadow"
                dir="ltr"
              >
                <span className="px-3 text-slate-500 bg-slate-50 border-r border-slate-200 h-10 flex items-center rounded-l-md text-sm">
                  +963
                </span>
                <input
                  id="edit-phone"
                  ref={phoneRef}
                  type="tel"
                  required
                  defaultValue={
                    (
                      school.phoneNumber || school.owner.phoneNumber
                    )?.startsWith("+963")
                      ? (
                          school.phoneNumber || school.owner.phoneNumber
                        )?.substring(4)
                      : (
                          school.phoneNumber || school.owner.phoneNumber
                        )?.replace(/^0/, "") || ""
                  }
                  placeholder="9xxxxxxxx"
                  className="flex-1 h-10 px-3 outline-none rounded-r-md text-sm bg-transparent"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                يجب أن يبدأ الرقم بـ 9 (مثال: 933123456)
              </p>
            </div> */}
            {/* --------------------------- */}

            <div className="space-y-1">
              <Label htmlFor="edit-image">
                شعار المدرسة
                <span className="text-xs text-slate-400 mr-1">
                  (اتركه فارغاً للإبقاء على الشعار الحالي)
                </span>
              </Label>
              <input
                id="edit-image"
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
                    alt="الشعار الجديد"
                    className="w-16 h-16 rounded-xl object-cover mb-3"
                  />
                ) : school.logo ? (
                  <FileImage
                    fileId={school.logo}
                    alt={school.name}
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
                    {school.logo && (
                      <button
                        type="button"
                        disabled={deletingImage}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage();
                        }}
                        className="text-xs text-red-500 hover:text-red-600 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingImage
                          ? "جاري حذف الشعار..."
                          : "حذف الشعار الحالي"}
                      </button>
                    )}
                  </>
                )}
              </div>
              {deleteImageError && (
                <p className="text-xs text-red-500">{deleteImageError}</p>
              )}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-11 px-7"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="h-11 px-7">
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
