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
import { getSchools, createSchool, GetSchoolsParams } from "@/api/schools";
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schoolNameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSkip(0);
    setSearch(searchInput);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const imageFile = imageRef.current?.files?.[0];
    if (!imageFile) {
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
        image: imageFile,
      });
      setDialogOpen(false);
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="البحث باسم المدرسة..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-9"
          />
        </div>
        <Button type="submit" variant="outline" className="h-12 p-4">
          بحث
        </Button>
        {/* {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setSearchInput(""); setSearch(""); setSkip(0); }}
          >
            مسح
          </Button>
        )} */}
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-0">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
              {totalRecords}
            </div>
            <div className="text-xs md:text-sm text-slate-500">
              إجمالي المدارس
            </div>
          </CardContent>
        </Card>
      </div>

      {/* States */}
      {loading && (
        <p className="text-center text-slate-500 py-12">جاري التحميل...</p>
      )}
      {error && <p className="text-center text-red-500 py-12">{error}</p>}

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
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
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
                    className="flex-1 gap-2 bg-green-100 text-green-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-green-200"
                  >
                    <Key size={16} className="shrink-0" /> مفاتيح
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-purple-100 text-purple-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-purple-200"
                  >
                    <Send size={16} className="shrink-0" /> إشعار
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-amber-100 text-amber-700 border-none text-xs md:text-sm h-9 md:h-10 hover:bg-amber-200"
                  >
                    <FileText size={16} className="shrink-0" /> تقرير
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
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={imageRef}
                required
              />
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
    </div>
  );
}
