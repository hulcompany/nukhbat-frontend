"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Edit2, Plus, Check, X } from "lucide-react";
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
import { getSchoolById, updateSchool } from "@/api/schools";
import { getTracks, grantTrackAccess, revokeTrackAccess } from "@/api/tracks";
import { downloadFile } from "@/api/files";
import { School } from "@/types/school";
import { Track } from "@/types/track";

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

type SchoolWithTracks = School & { tracks: Track[] };

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editOpen, setEditOpen] = useState(searchParams.get("edit") === "true");

  const [school, setSchool] = useState<SchoolWithTracks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  async function fetchSchool() {
    setLoading(true);
    setError(null);
    try {
      const res = await getSchoolById(id);
      setSchool({ ...res.data, tracks: res.data.tracks ?? [] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchool();
  }, [id]);

  function openTrackDialog() {
    setTrackDialogOpen(true);
    if (allTracks.length === 0) {
      setTracksLoading(true);
      getTracks()
        .then((res) => setAllTracks(res.data))
        .finally(() => setTracksLoading(false));
    }
  }

  async function handleGrantAccess(trackId: string) {
    setGrantingId(trackId);
    try {
      await grantTrackAccess(id, trackId);
      await fetchSchool();
    } finally {
      setGrantingId(null);
    }
  }

  async function handleRevokeAccess(trackId: string) {
    setRevokingId(trackId);
    try {
      await revokeTrackAccess(id, trackId);
      await fetchSchool();
    } finally {
      setRevokingId(null);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!school) return;

    setSubmitting(true);
    setFormError(null);
    try {
      let imageFile = imageRef.current?.files?.[0];

      // If no new image selected, re-fetch and re-send the current logo
      if (!imageFile && school.logo) {
        const blob = await downloadFile(school.logo);
        imageFile = new File([blob], "logo", { type: blob.type });
      }

      if (!imageFile) {
        setFormError("يرجى اختيار صورة");
        setSubmitting(false);
        return;
      }

      await updateSchool(id, {
        name: nameRef.current!.value,
        image: imageFile,
      });

      setEditOpen(false);
      fetchSchool();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error ?? "المدرسة غير موجودة"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{school.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">تفاصيل المدرسة</p>
        </div>
        <Button
          className="mr-auto gap-2 h-11 p-4 px-7"
          onClick={() => setEditOpen(true)}
        >
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
                label: "الدور",
                val: school.owner.role,
              },
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
                <div className="text-sm font-semibold">{item.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tracks */}
      <Card className="p-0">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">المسارات</h3>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={openTrackDialog}
            >
              <Plus className="w-4 h-4" /> منح صلاحية مسار
            </Button>
          </div>
          {school.tracks.length === 0 ? (
            <p className="text-sm text-slate-400">
              لا توجد مسارات مخصصة لهذه المدرسة
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {school.tracks.map((track) => (
                <span
                  key={track.id}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {track.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant Track Access Dialog */}
      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>منح صلاحية مسار</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {tracksLoading && (
              <p className="text-center text-slate-500 py-6">جاري التحميل...</p>
            )}
            {!tracksLoading && allTracks.length === 0 && (
              <p className="text-center text-slate-400 py-6">
                لا توجد مسارات متاحة
              </p>
            )}
            {!tracksLoading &&
              allTracks.map((track) => {
                const assigned = school.tracks.some((t) => t.id === track.id);
                const isGranting = grantingId === track.id;
                const isRevoking = revokingId === track.id;
                const busy = isGranting || isRevoking;
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border text-sm"
                  >
                    <span className="font-medium">{track.name}</span>
                    {assigned ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-emerald-600 text-xs">
                          <Check className="w-4 h-4" /> مُفعَّل
                        </span>
                        <button
                          disabled={busy}
                          onClick={() => handleRevokeAccess(track.id)}
                          className="flex items-center gap-1 text-red-500 text-xs hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3 h-3" />
                          {isRevoking ? "جاري الإلغاء..." : "إلغاء"}
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => handleGrantAccess(track.id)}
                        className="text-blue-600 text-xs hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGranting ? "جاري المنح..." : "منح"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المدرسة</DialogTitle>
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
            <div className="space-y-1">
              <Label htmlFor="edit-image">
                شعار المدرسة
                <span className="text-xs text-slate-400 mr-1">
                  (اتركه فارغاً للإبقاء على الشعار الحالي)
                </span>
              </Label>
              {school.logo && (
                <FileImage
                  fileId={school.logo}
                  alt={school.name}
                  className="w-16 h-16 rounded-xl object-cover mb-2"
                />
              )}
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                ref={imageRef}
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-11 p-4 px-7"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 p-4 px-7"
              >
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
