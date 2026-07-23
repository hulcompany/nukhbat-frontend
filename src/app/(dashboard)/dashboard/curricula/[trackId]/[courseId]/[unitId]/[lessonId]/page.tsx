"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Edit2,
  X,
  Trash2,
  Plus,
  Upload,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Circle,
  Lock,
  ImageIcon,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  getLessonQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestionImage,
  deleteQuestion,
  bulkCreateQuestions,
  bulkDeleteQuestions,
} from "@/api/question";
import { getUnitLessons } from "@/api/lesson";
import { downloadFile } from "@/api/files";
import {
  Question,
  QuestionType,
  QuestionOptionInput,
  QuestionMatchItemInput,
  BulkQuestionInput,
} from "@/types/question";
import { Lesson } from "@/types/lesson";
import { ApiError } from "@/lib/errors";

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

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
}

function parseBulkQuestions(
  text: string,
  lessonId: string,
): BulkQuestionInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("ملف غير صالح: يجب أن يكون بصيغة JSON");
  }

  const questions = (parsed as { questions?: unknown[] } | null)?.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("يجب أن يحتوي الملف على مصفوفة questions غير فارغة");
  }

  return questions.map((q, i) => {
    const item = q as Record<string, unknown>;
    const label = `السؤال رقم ${i + 1}`;

    if (!item.title || typeof item.title !== "string") {
      throw new Error(`${label}: يجب إدخال نص السؤال`);
    }

    if (item.type === "options") {
      if (!Array.isArray(item.options) || item.options.length < 2) {
        throw new Error(`${label}: يجب إضافة خيارين على الأقل`);
      }
      return {
        title: item.title,
        type: "options",
        lessonId,
        options: item.options as QuestionOptionInput[],
      };
    }

    if (item.type === "match") {
      if (!Array.isArray(item.matchingItems) || item.matchingItems.length < 3) {
        throw new Error(`${label}: يجب إضافة عناصر توصيل كافية`);
      }
      return {
        title: item.title,
        type: "match",
        lessonId,
        matchingItems: item.matchingItems as QuestionMatchItemInput[],
      };
    }

    if (item.type === "trueFalse") {
      if (typeof item.correctAnswer !== "boolean") {
        throw new Error(`${label}: يجب تحديد الإجابة الصحيحة (true أو false)`);
      }
      return {
        title: item.title,
        type: "trueFalse",
        lessonId,
        correctAnswer: item.correctAnswer,
      };
    }

    throw new Error(`${label}: نوع السؤال يجب أن يكون options أو match أو trueFalse`);
  });
}

function BulkImportDialog({
  lessonId,
  onClose,
  onSaved,
}: {
  lessonId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFormError("يرجى اختيار ملف JSON");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const text = await file.text();
      const questions = parseBulkQuestions(text, lessonId);
      await bulkCreateQuestions({ questions });
      onSaved();
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pt-5">استيراد أسئلة من ملف JSON</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-3">
            <Label htmlFor="bulk-file">ملف الأسئلة</Label>
            <input
              id="bulk-file"
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? "bg-blue-50 border-blue-400"
                  : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <FileJson className="h-6 w-6 text-blue-600" />
              </div>
              {file ? (
                <>
                  <p className="text-sm font-bold text-slate-900">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    إزالة الملف
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900">
                    اسحب ملف JSON هنا
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    أو انقر لاختيار ملف · يُقبل فقط ملفات json.
                  </p>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              يجب أن يحتوي الملف على مصفوفة questions، وكل سؤال من نوع options
              أو match أو trueFalse. سيتم ربط جميع الأسئلة المستوردة بهذا الدرس
              تلقائياً.
            </p>
          </div>

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
            <Button type="submit" disabled={submitting} className="p-4 h-12">
              {submitting ? "جاري الاستيراد..." : "استيراد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

function QuestionFormDialog({
  lessonId,
  editing,
  onClose,
  onSaved,
}: {
  lessonId: string;
  editing: Question | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [type, setType] = useState<QuestionType>(editing?.type ?? "options");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
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
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    if (file) setImageRemoved(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  }

  function switchType(next: QuestionType) {
    if (next === type) return;
    setType(next);
    setAnswersDirty(true);
    setFormError(null);
  }

  function validate(): string | null {
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

  function buildOptionInputs(): QuestionOptionInput[] {
    return options.map((o) => ({
      text: o.text.trim(),
      isCorrect: o.isCorrect,
    }));
  }

  function buildMatchInputs(): QuestionMatchItemInput[] {
    // The full array is sent bases-first, so a base's correctIndex is
    // the paired match's offset after all base rows.
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
        if (imageRemoved && !imageFile && editing.imageId) {
          await deleteQuestionImage(editing.id);
        }
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
          lessonId,
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
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClassName =
    "h-10 w-full rounded-lg border border-slate-200 bg-slate-100/50 px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200";

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
            <Input
              id="question-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="معاينة صورة السؤال"
                  className="max-h-40 rounded-lg border border-slate-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:text-red-600"
                >
                  إزالة الصورة
                </Button>
              </div>
            ) : (
              editing?.imageId &&
              !imageRemoved && (
                <div className="flex items-center gap-3">
                  <FileImage
                    fileId={editing.imageId}
                    alt="صورة السؤال الحالية"
                    className="max-h-40 rounded-lg border border-slate-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-600"
                  >
                    إزالة الصورة
                  </Button>
                </div>
              )
            )}
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
            <Button type="submit" disabled={submitting} className="p-4 h-12">
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

export default function LessonQuestionsPage() {
  const { unitId, lessonId } = useParams<{
    trackId: string;
    courseId: string;
    unitId: string;
    lessonId: string;
  }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const locked = lesson?.status === "active";

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [questionsRes, lessonsRes] = await Promise.all([
        getLessonQuestions({ lessonId }),
        getUnitLessons(unitId),
      ]);
      setQuestions(
        [...questionsRes.data.list].sort((a, b) => a.index - b.index),
      );
      setLesson(lessonsRes.data.find((l) => l.id === lessonId) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, unitId]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteQuestion(deleteTarget.id);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(formatError(e));
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;

    setBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      const ids = Array.from(selectedIds);
      await bulkDeleteQuestions(ids);
      setQuestions((prev) => prev.filter((q) => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch (e) {
      setBulkDeleteError(formatError(e));
    } finally {
      setBulkDeleting(false);
    }
  }

  function closeForm() {
    setFormOpen(false);
    setEditingQuestion(null);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
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
            <h1 className="text-xl md:text-2xl font-bold">أسئلة الدرس</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {lesson
                ? `إدارة أسئلة درس "${lesson.title}"`
                : "إدارة أسئلة هذا الدرس"}
            </p>
          </div>
        </div>
        {!locked && (
          <div className="flex items-center gap-2">
            <ActionButton
              label="استيراد أسئلة"
              icon={Upload}
              bgClassName="bg-slate-600 hover:bg-slate-700 shadow-slate-200"
              onClick={() => setBulkOpen(true)}
            />
            <ActionButton
              label="إضافة سؤال"
              icon={Plus}
              bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              onClick={() => {
                setEditingQuestion(null);
                setFormOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {!locked && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm text-red-700 font-medium">
            تم تحديد {selectedIds.size} سؤال
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              إلغاء التحديد
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setBulkDeleteError(null);
                setBulkDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 ml-1" /> حذف المحدد
            </Button>
          </div>
        </div>
      )}

      {locked && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Lock className="h-4 w-4 shrink-0" />
          الدرس نشط حالياً — قم بإلغاء تفعيل الدرس لتتمكن من تعديل أسئلته.
        </div>
      )}

      {reorderError && (
        <p className="text-sm text-red-500 text-center">{reorderError}</p>
      )}

      {loading && <ListCardSkeleton />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchData} />
      )}

      {!loading && !error && questions.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          لا توجد أسئلة لهذا الدرس بعد
        </p>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="flex flex-col gap-4">
          {questions.map((question, index) => {
            const isExpanded = expandedId === question.id;
            const typeMeta = TYPE_META[question.type] ?? {
              label: question.type ?? "غير معروف",
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
                    {!locked && (
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-blue-600"
                        checked={selectedIds.has(question.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(question.id)}
                      />
                    )}
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${typeMeta.className}`}
                      >
                        {typeMeta.label}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0 w-full md:w-auto justify-end border-t border-slate-50 md:border-0 pt-3 md:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!locked && (
                      <>
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
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(question);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
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

      {/* Create / Edit Question Dialog */}
      {formOpen && (
        <QuestionFormDialog
          key={editingQuestion?.id ?? "new"}
          lessonId={lessonId}
          editing={editingQuestion}
          onClose={closeForm}
          onSaved={() => {
            closeForm();
            fetchData();
          }}
        />
      )}

      {/* Bulk Import Questions Dialog */}
      {bulkOpen && (
        <BulkImportDialog
          lessonId={lessonId}
          onClose={() => setBulkOpen(false)}
          onSaved={() => {
            setBulkOpen(false);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">حذف السؤال</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف سؤال &quot;{deleteTarget?.title}&quot;؟ لا يمكن
            التراجع عن هذا الإجراء.
          </p>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="p-4 h-12"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
              className="p-4 h-12"
            >
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
      >
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="pt-5">حذف الأسئلة المحددة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            هل أنت متأكد من حذف {selectedIds.size} سؤال؟ لا يمكن التراجع عن هذا
            الإجراء.
          </p>
          {bulkDeleteError && (
            <p className="text-sm text-red-500">{bulkDeleteError}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              className="p-4 h-12"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
              className="p-4 h-12"
            >
              {bulkDeleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
