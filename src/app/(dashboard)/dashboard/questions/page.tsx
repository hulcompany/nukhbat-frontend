"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  X,
  ChevronDown,
  HelpCircle,
  ImageIcon,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Loader2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTracks } from "@/api/tracks";
import { getSchoolCourses } from "@/api/courses";
import {
  createQuestion,
  updateQuestion,
  getLessonQuestions,
} from "@/api/question";
import { downloadFile } from "@/api/files";
import { Track } from "@/types/track";
import { Subject } from "@/types/courses";
import { Question, QuestionType } from "@/types/question";
import { ApiError } from "@/lib/errors";

const PAGE_SIZE = 10;

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

const TYPE_META: Record<QuestionType, { label: string; className: string }> = {
  options: {
    label: "اختيار متعدد",
    className: "bg-blue-100 text-blue-600 border-blue-200",
  },
  match: {
    label: "توصيل",
    className: "bg-violet-100 text-violet-600 border-violet-200",
  },
  trueFalse: {
    label: "صح أو خطأ",
    className: "bg-amber-100 text-amber-600 border-amber-200",
  },
};

const PURPOSE_META: Record<string, { label: string; className: string }> = {
  lesson: {
    label: "درس",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  dailyChallenge: {
    label: "تحدي يومي",
    className: "bg-amber-100 text-amber-600 border-amber-200",
  },
};

interface OptionRow {
  text: string;
  isCorrect: boolean;
}

interface BaseRow {
  text: string;
  matchIndex: number | null;
}

interface MatchRow {
  text: string;
}

const selectClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-100/50 px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200";

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

function QuestionFormDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Question | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Subject[]>([]);
  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [type, setType] = useState<QuestionType>(editing?.type ?? "options");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [answersDirty, setAnswersDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [options, setOptions] = useState<OptionRow[]>(() => {
    if (editing && editing.type === "options" && editing.options.length > 0) {
      return editing.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      }));
    }
    return [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];
  });
  const [bases, setBases] = useState<BaseRow[]>(() => {
    if (editing && editing.type === "match") {
      const matchItems = editing.matchingItems.filter(
        (m) => m.type === "match",
      );
      const baseItems = editing.matchingItems.filter((m) => m.type === "base");
      if (baseItems.length > 0) {
        return baseItems.map((b) => {
          const matchIndex = matchItems.findIndex(
            (m) => m.id === b.correctMatchId,
          );
          return {
            text: b.text,
            matchIndex: matchIndex < 0 ? null : matchIndex,
          };
        });
      }
    }
    return [
      { text: "", matchIndex: null },
      { text: "", matchIndex: null },
    ];
  });
  const [matches, setMatches] = useState<MatchRow[]>(() => {
    if (editing && editing.type === "match") {
      const matchItems = editing.matchingItems.filter(
        (m) => m.type === "match",
      );
      if (matchItems.length > 0) {
        return matchItems.map((m) => ({ text: m.text }));
      }
    }
    return [{ text: "" }, { text: "" }];
  });

  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(
    editing?.type === "trueFalse" ? (editing.trueOrFalseAnswer ?? true) : true,
  );

  useEffect(() => {
    if (editing) return;
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, [editing]);

  useEffect(() => {
    if (editing || !trackId) return;
    setCoursesLoading(true);
    getSchoolCourses(trackId)
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [editing, trackId]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function selectImage(file: File | null) {
    if (file && !file.type.startsWith("image/")) {
      setFormError("يُقبل فقط ملفات الصور");
      return;
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    if (!file && imageInputRef.current) imageInputRef.current.value = "";
  }

  function switchType(next: QuestionType) {
    if (next === type) return;
    setType(next);
    setAnswersDirty(true);
    setFormError(null);
  }

  function validate(): string | null {
    if (!editing && !courseId) return "يجب اختيار المسار والمادة";
    if (!title.trim()) return "يجب إدخال نص السؤال";

    if (type === "options") {
      if (options.length < 2) return "يجب إضافة خيارين على الأقل";
      if (options.some((o) => !o.text.trim())) return "أدخل نص جميع الخيارات";
      if (options.filter((o) => o.isCorrect).length !== 1)
        return "يجب تحديد إجابة صحيحة واحدة";
      return null;
    }

    if (type === "trueFalse") return null;

    if (bases.length < 1) return "أضف عنصراً أساسياً واحداً على الأقل";
    if (bases.length + matches.length < 3)
      return "يجب ألا يقل عدد عناصر التوصيل عن 3";
    if (matches.length < bases.length)
      return "عدد الإجابات يجب ألا يقل عن عدد العناصر الأساسية";
    if (
      bases.some((b) => !b.text.trim()) ||
      matches.some((m) => !m.text.trim())
    )
      return "أدخل نص جميع عناصر التوصيل";
    if (bases.some((b) => b.matchIndex === null))
      return "اختر الإجابة الصحيحة لكل عنصر أساسي";
    const used = bases.map((b) => b.matchIndex);
    if (new Set(used).size !== used.length)
      return "لا يمكن ربط عنصرين أساسيين بنفس الإجابة";
    return null;
  }

  function buildOptionInputs() {
    return options.map((o) => ({
      text: o.text.trim(),
      isCorrect: o.isCorrect,
    }));
  }

  function buildMatchInputs() {
    return [
      ...bases.map((b) => ({
        text: b.text.trim(),
        type: "base" as const,
        correctIndex: bases.length + (b.matchIndex as number),
      })),
      ...matches.map((m) => ({ text: m.text.trim(), type: "match" as const })),
    ];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await updateQuestion(editing.id, {
          title: title.trim(),
          ...(imageFile ? { image: imageFile } : {}),
          ...(answersDirty
            ? type === "options"
              ? { type, options: buildOptionInputs() }
              : type === "match"
                ? { type, matchingItems: buildMatchInputs() }
                : { type, correctAnswer: trueFalseAnswer }
            : {}),
        });
      } else {
        await createQuestion({
          title: title.trim(),
          type,
          courseId,
          purpose: "dailyChallenge",
          ...(imageFile ? { image: imageFile } : {}),
          ...(type === "options"
            ? { options: buildOptionInputs() }
            : type === "match"
              ? { matchingItems: buildMatchInputs() }
              : { correctAnswer: trueFalseAnswer }),
        });
      }
      onSaved();
    } catch (err) {
      console.log(err);
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir="rtl"
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="pt-5">
            {editing ? "تعديل السؤال" : "إضافة سؤال جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>المسار</Label>
                <select
                  className={selectClassName}
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    setCourseId("");
                    setCourses([]);
                  }}
                >
                  <option value="">اختر المسار</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label>المادة</Label>
                <select
                  className={selectClassName}
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={!trackId || coursesLoading}
                >
                  <option value="">
                    {coursesLoading ? "جارٍ التحميل..." : "اختر المادة"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="question-title">نص السؤال</Label>
            <Input
              id="question-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="question-image">صورة السؤال (اختياري)</Label>
            <input
              ref={imageInputRef}
              id="question-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => selectImage(e.target.files?.[0] ?? null)}
            />
            <div
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingImage(false);
                selectImage(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDraggingImage
                  ? "bg-blue-50 border-blue-400"
                  : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
              }`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="معاينة صورة السؤال"
                    className="max-h-40 rounded-lg border border-slate-200 mb-2"
                  />
                  {imageFile && (
                    <p className="text-xs text-slate-500">{imageFile.name}</p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectImage(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    إزالة الصورة
                  </button>
                </>
              ) : editing?.imageId ? (
                <>
                  <FileImage
                    fileId={editing.imageId}
                    alt="صورة السؤال الحالية"
                    className="max-h-40 rounded-lg border border-slate-200 mb-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    اضغط أو اسحب صورة جديدة للاستبدال
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <ImageIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    اسحب الصورة هنا
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    أو اضغط للاختيار من جهازك
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>نوع السؤال</Label>
            <div className="flex gap-2">
              {(Object.keys(TYPE_META) as QuestionType[]).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  onClick={() => switchType(t)}
                  className="h-10"
                >
                  {TYPE_META[t].label}
                </Button>
              ))}
            </div>
          </div>

          {type === "options" && (
            <div className="space-y-3">
              <Label>الخيارات (حدد الإجابة الصحيحة)</Label>
              {options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    className="h-4 w-4 shrink-0 accent-blue-600"
                    checked={option.isCorrect}
                    onChange={() => {
                      setOptions((prev) =>
                        prev.map((o, j) => ({ ...o, isCorrect: j === i })),
                      );
                      setAnswersDirty(true);
                    }}
                  />
                  <Input
                    value={option.text}
                    placeholder={`الخيار ${i + 1}`}
                    onChange={(e) => {
                      setOptions((prev) =>
                        prev.map((o, j) =>
                          j === i ? { ...o, text: e.target.value } : o,
                        ),
                      );
                      setAnswersDirty(true);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    disabled={options.length <= 2}
                    onClick={() => {
                      setOptions((prev) => {
                        const next = prev.filter((_, j) => j !== i);
                        if (!next.some((o) => o.isCorrect) && next.length > 0) {
                          next[0] = { ...next[0], isCorrect: true };
                        }
                        return next;
                      });
                      setAnswersDirty(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setOptions((prev) => [
                    ...prev,
                    { text: "", isCorrect: false },
                  ]);
                  setAnswersDirty(true);
                }}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة خيار
              </Button>
            </div>
          )}

          {type === "match" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>العناصر الأساسية</Label>
                {bases.map((base, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={base.text}
                        placeholder={`العنصر ${i + 1}`}
                        onChange={(e) => {
                          setBases((prev) =>
                            prev.map((b, j) =>
                              j === i ? { ...b, text: e.target.value } : b,
                            ),
                          );
                          setAnswersDirty(true);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        disabled={bases.length <= 1}
                        onClick={() => {
                          setBases((prev) => prev.filter((_, j) => j !== i));
                          setAnswersDirty(true);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <select
                      className={selectClassName}
                      value={base.matchIndex ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? null : Number(e.target.value);
                        setBases((prev) =>
                          prev.map((b, j) =>
                            j === i ? { ...b, matchIndex: value } : b,
                          ),
                        );
                        setAnswersDirty(true);
                      }}
                    >
                      <option value="">اختر الإجابة الصحيحة</option>
                      {matches.map((m, j) => (
                        <option key={j} value={j}>
                          {m.text.trim() || `الإجابة ${j + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBases((prev) => [
                      ...prev,
                      { text: "", matchIndex: null },
                    ]);
                    setAnswersDirty(true);
                  }}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة عنصر
                </Button>
              </div>

              <div className="space-y-3">
                <Label>الإجابات (يمكن إضافة إجابات تمويه)</Label>
                {matches.map((match, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={match.text}
                      placeholder={`الإجابة ${i + 1}`}
                      onChange={(e) => {
                        setMatches((prev) =>
                          prev.map((m, j) =>
                            j === i ? { text: e.target.value } : m,
                          ),
                        );
                        setAnswersDirty(true);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      disabled={matches.length <= 1}
                      onClick={() => {
                        setMatches((prev) => prev.filter((_, j) => j !== i));
                        setBases((prev) =>
                          prev.map((b) =>
                            b.matchIndex === null
                              ? b
                              : b.matchIndex === i
                                ? { ...b, matchIndex: null }
                                : b.matchIndex > i
                                  ? { ...b, matchIndex: b.matchIndex - 1 }
                                  : b,
                          ),
                        );
                        setAnswersDirty(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMatches((prev) => [...prev, { text: "" }]);
                    setAnswersDirty(true);
                  }}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة إجابة
                </Button>
              </div>
            </div>
          )}

          {type === "trueFalse" && (
            <div className="space-y-3">
              <Label>الإجابة الصحيحة</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={trueFalseAnswer ? "default" : "outline"}
                  className="h-10 flex-1"
                  onClick={() => {
                    setTrueFalseAnswer(true);
                    setAnswersDirty(true);
                  }}
                >
                  صح
                </Button>
                <Button
                  type="button"
                  variant={!trueFalseAnswer ? "default" : "outline"}
                  className="h-10 flex-1"
                  onClick={() => {
                    setTrueFalseAnswer(false);
                    setAnswersDirty(true);
                  }}
                >
                  خطأ
                </Button>
              </div>
            </div>
          )}

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="p-4 h-12"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting} className="px-10 h-12">
              {submitting
                ? "جاري الحفظ..."
                : editing
                  ? "حفظ التعديلات"
                  : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Questions() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Subject[]>([]);
  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    if (!trackId) return;
    setCoursesLoading(true);
    getSchoolCourses(trackId)
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [trackId]);

  function fetchQuestions() {
    if (!courseId) {
      setQuestions([]);
      setTotalRecords(0);
      return;
    }
    setLoading(true);
    setError(null);
    getLessonQuestions({ courseId, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then((res) => {
        setQuestions(res.data.list);
        setTotalRecords(res.data.totalRecords);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, page]);

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الأسئلة</h1>
          <p className="text-sm text-slate-500 mt-1">
            اختر المسار والمادة لعرض أسئلتها
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-10"
          onClick={() => {
            setEditingQuestion(null);
            setFormOpen(true);
          }}
        >
          إضافة سؤال
          <Plus className="mr-2 h-4 w-4" />
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>المسار</Label>
            <select
              className={selectClassName}
              value={trackId}
              onChange={(e) => {
                setTrackId(e.target.value);
                setCourseId("");
                setCourses([]);
                setPage(0);
              }}
            >
              <option value="">اختر المسار</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>المادة</Label>
            <select
              className={selectClassName}
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setPage(0);
              }}
              disabled={!trackId || coursesLoading}
            >
              <option value="">
                {coursesLoading ? "جارٍ التحميل..." : "اختر المادة"}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Search Input Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="بحث في نص السؤال..."
              className="w-full pr-10 h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!courseId}
            />
          </div>
        </CardContent>
      </Card>

      {!courseId && (
        <p className="text-center text-slate-400 py-16">
          اختر المسار والمادة لعرض الأسئلة
        </p>
      )}

      {courseId && loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin ml-2" />
          جارٍ التحميل...
        </div>
      )}

      {courseId && !loading && error && (
        <ErrorState message={error} onRetry={fetchQuestions} />
      )}

      {courseId && !loading && !error && filteredQuestions.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد أسئلة لهذه المادة
        </p>
      )}

      {courseId && !loading && !error && filteredQuestions.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredQuestions.map((question) => {
            const isExpanded = expandedId === question.id;
            const typeMeta = TYPE_META[question.type];
            const purposeMeta = PURPOSE_META[question.purpose] ?? {
              label: question.purpose,
              className: "bg-slate-100 text-slate-600 border-slate-200",
            };
            const matchItems = question.matchingItems.filter(
              (m) => m.type === "match",
            );
            const baseItems = question.matchingItems.filter(
              (m) => m.type === "base",
            );
            const decoys = matchItems.filter(
              (m) => !baseItems.some((b) => b.correctMatchId === m.id),
            );
            return (
              <Card
                key={question.id}
                onClick={() => setExpandedId(isExpanded ? null : question.id)}
                className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      {question.imageId ? (
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">
                        {question.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeMeta.className}`}
                        >
                          {typeMeta.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${purposeMeta.className}`}
                        >
                          {purposeMeta.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0 w-full md:w-auto justify-end border-t border-slate-50 md:border-0 pt-3 md:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingQuestion(question);
                        setFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : question.id)
                      }
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="border-t border-slate-100 pt-4 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {question.imageId && (
                      <FileImage
                        fileId={question.imageId}
                        alt={question.title}
                        className="max-h-40 rounded-lg border border-slate-200"
                      />
                    )}

                    {question.type === "options" && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                              option.isCorrect
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0" />
                            )}
                            {option.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "match" && (
                      <div className="space-y-2">
                        {baseItems.map((base) => {
                          const paired = matchItems.find(
                            (m) => m.id === base.correctMatchId,
                          );
                          return (
                            <div
                              key={base.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                                {base.text}
                              </span>
                              <ArrowLeft className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                                {paired?.text ?? "—"}
                              </span>
                            </div>
                          );
                        })}
                        {decoys.length > 0 && (
                          <p className="text-xs text-slate-400">
                            إجابات تمويه: {decoys.map((d) => d.text).join("، ")}
                          </p>
                        )}
                      </div>
                    )}

                    {question.type === "trueFalse" && (
                      <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        الإجابة الصحيحة: {question.trueOrFalseAnswer ? "صح" : "خطأ"}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {courseId && !loading && !error && (
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

      {/* Add/Edit Question Dialog */}
      {formOpen && (
        <QuestionFormDialog
          key={editingQuestion?.id ?? "new"}
          editing={editingQuestion}
          onClose={() => {
            setFormOpen(false);
            setEditingQuestion(null);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditingQuestion(null);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
