"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Edit2,
  Plus,
  Check,
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
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
import { Skeleton } from "@/components/ui/skeleton";
import { getSchoolById, updateSchool, deleteSchoolImage } from "@/api/schools";
import { getTracks, grantTrackAccess, revokeTrackAccess } from "@/api/tracks";
import { downloadFile } from "@/api/files";
import {
  getAdminCourses,
  getAdminUnits,
  getAdminLessons,
  getAdminQuestions,
} from "@/api/admin-learning";
import { School } from "@/types/school";
import { Track } from "@/types/track";
import { AdminCourse, AdminUnit, AdminLesson } from "@/types/admin-learning";
import { Question } from "@/types/question";
import { LessonStatus } from "@/types/lesson";

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

const QUESTIONS_LIMIT = 10;

const lessonStatusStyles: Record<LessonStatus, { label: string; cls: string }> =
  {
    active: { label: "مفعل", cls: "bg-emerald-100 text-emerald-700" },
    draft: { label: "مسودة", cls: "bg-amber-100 text-amber-700" },
    unActive: { label: "غير مفعل", cls: "bg-slate-100 text-slate-500" },
  };

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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

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
      const res = await getSchoolById(id);
      setSchool({ ...res.data, tracks: res.data.allowedTracks ?? [] });
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

  // Curriculum browser (track -> courses -> units -> lessons -> questions)
  const [selTrack, setSelTrack] = useState<Track | null>(null);
  const [selCourse, setSelCourse] = useState<AdminCourse | null>(null);
  const [selUnit, setSelUnit] = useState<AdminUnit | null>(null);
  const [selLesson, setSelLesson] = useState<AdminLesson | null>(null);

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsSkip, setQuestionsSkip] = useState(0);

  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);

  async function openTrack(track: Track) {
    setSelTrack(track);
    setSelCourse(null);
    setSelUnit(null);
    setSelLesson(null);
    setBrowserLoading(true);
    setBrowserError(null);
    try {
      const res = await getAdminCourses({ trackId: track.id });
      setCourses(res.data);
    } catch (e) {
      setBrowserError((e as Error).message);
    } finally {
      setBrowserLoading(false);
    }
  }

  async function openCourse(course: AdminCourse) {
    setSelCourse(course);
    setSelUnit(null);
    setSelLesson(null);
    setBrowserLoading(true);
    setBrowserError(null);
    try {
      const res = await getAdminUnits({ schoolId: id, courseId: course.id });
      setUnits(res.data.filter((u) => u.courseId === course.id));
    } catch (e) {
      setBrowserError((e as Error).message);
    } finally {
      setBrowserLoading(false);
    }
  }

  async function openUnit(unit: AdminUnit) {
    setSelUnit(unit);
    setSelLesson(null);
    setBrowserLoading(true);
    setBrowserError(null);
    try {
      const res = await getAdminLessons({
        unitId: unit.id,
        courseId: unit.courseId,
        schoolId: id,
      });
      setLessons(res.data);
    } catch (e) {
      setBrowserError((e as Error).message);
    } finally {
      setBrowserLoading(false);
    }
  }

  function openLesson(lesson: AdminLesson) {
    setSelLesson(lesson);
    setQuestionsSkip(0);
  }

  function closeBrowser() {
    setSelTrack(null);
    setSelCourse(null);
    setSelUnit(null);
    setSelLesson(null);
    setBrowserError(null);
  }

  useEffect(() => {
    if (!selLesson) return;
    let cancelled = false;
    setBrowserLoading(true);
    setBrowserError(null);
    getAdminQuestions({
      skip: questionsSkip,
      limit: QUESTIONS_LIMIT,
      lessonId: selLesson.id,
      schoolId: id,
    })
      .then((res) => {
        if (cancelled) return;
        setQuestions(res.data.list);
        setQuestionsTotal(res.data.totalRecords);
      })
      .catch((e) => {
        if (!cancelled) setBrowserError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setBrowserLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selLesson, questionsSkip, id]);

  async function handleDeleteImage() {
    setDeletingImage(true);
    setFormError(null);
    try {
      await deleteSchoolImage(id);
      setSchool((s) => (s ? { ...s, logo: null } : s));
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setDeletingImage(false);
    }
  }

  async function handleEdit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!school) return;

    setSubmitting(true);
    setFormError(null);
    try {
      let imageFile: File | undefined = logoFile ?? undefined;

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
      selectLogo(null);
      fetchSchool();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-11 w-28 mr-auto rounded-md" />
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

        {/* Tracks */}
        <Card className="p-0">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
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
                <button
                  key={track.id}
                  type="button"
                  onClick={() => openTrack(track)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selTrack?.id === track.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Curriculum Browser */}
      {selTrack && (
        <Card className="p-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> محتوى المسار
              </h3>
              <button
                type="button"
                onClick={closeBrowser}
                className="text-slate-400 hover:text-slate-600"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <button
                type="button"
                onClick={() => openTrack(selTrack)}
                className={
                  selCourse
                    ? "text-blue-600 hover:underline"
                    : "font-semibold text-slate-900"
                }
              >
                {selTrack.name}
              </button>
              {selCourse && (
                <>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <button
                    type="button"
                    onClick={() => openCourse(selCourse)}
                    className={
                      selUnit
                        ? "text-blue-600 hover:underline"
                        : "font-semibold text-slate-900"
                    }
                  >
                    {selCourse.title}
                  </button>
                </>
              )}
              {selUnit && (
                <>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <button
                    type="button"
                    onClick={() => openUnit(selUnit)}
                    className={
                      selLesson
                        ? "text-blue-600 hover:underline"
                        : "font-semibold text-slate-900"
                    }
                  >
                    {selUnit.title}
                  </button>
                </>
              )}
              {selLesson && (
                <>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="font-semibold text-slate-900">
                    {selLesson.title}
                  </span>
                </>
              )}
            </div>

            {browserLoading && (
              <p className="text-center text-slate-500 py-8">
                جاري التحميل...
              </p>
            )}
            {!browserLoading && browserError && (
              <p className="text-center text-red-500 py-8">{browserError}</p>
            )}

            {/* Courses */}
            {!browserLoading && !browserError && !selCourse && (
              <div className="space-y-2">
                {courses.length === 0 && (
                  <p className="text-center text-slate-400 py-8">
                    لا توجد مواد لهذا المسار
                  </p>
                )}
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => openCourse(course)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">{course.title}</span>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Units */}
            {!browserLoading && !browserError && selCourse && !selUnit && (
              <div className="space-y-2">
                {units.length === 0 && (
                  <p className="text-center text-slate-400 py-8">
                    لا توجد وحدات لهذه المادة
                  </p>
                )}
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => openUnit(unit)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">{unit.title}</span>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Lessons */}
            {!browserLoading && !browserError && selUnit && !selLesson && (
              <div className="space-y-2">
                {lessons.length === 0 && (
                  <p className="text-center text-slate-400 py-8">
                    لا توجد دروس لهذه الوحدة
                  </p>
                )}
                {lessons.map((lesson) => {
                  const status =
                    lessonStatusStyles[lesson.status] ??
                    lessonStatusStyles.draft;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => openLesson(lesson)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-right min-w-0">
                        <div className="font-medium truncate">
                          {lesson.title}
                        </div>
                        {lesson.description && (
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {lesson.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500">
                          {lesson.questionCount} سؤال
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${status.cls}`}
                        >
                          {status.label}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Questions */}
            {!browserLoading && !browserError && selLesson && (
              <div className="space-y-2">
                {questions.length === 0 && (
                  <p className="text-center text-slate-400 py-8">
                    لا توجد أسئلة لهذا الدرس
                  </p>
                )}
                {questions.map((question, qi) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center shrink-0">
                        {questionsSkip + qi + 1}
                      </span>
                      <span className="font-medium truncate">
                        {question.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">
                        {question.type === "options"
                          ? `${question.options.length} خيارات`
                          : `${question.matchingItems.length} عناصر`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          question.type === "options"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {question.type === "options"
                          ? "اختيار من متعدد"
                          : "مطابقة"}
                      </span>
                    </div>
                  </div>
                ))}

                {questionsTotal > QUESTIONS_LIMIT && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuestionsSkip((s) =>
                          Math.max(0, s - QUESTIONS_LIMIT),
                        )
                      }
                      disabled={questionsSkip === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {Math.floor(questionsSkip / QUESTIONS_LIMIT) + 1} /{" "}
                      {Math.ceil(questionsTotal / QUESTIONS_LIMIT)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionsSkip((s) => s + QUESTIONS_LIMIT)}
                      disabled={
                        questionsSkip + QUESTIONS_LIMIT >= questionsTotal
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grant Track Access Dialog */}
      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-6">منح صلاحية مسار</DialogTitle>
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
            <DialogTitle className="pt-6">تعديل المدرسة</DialogTitle>
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
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-12 p-4"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 p-4 px-7"
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
