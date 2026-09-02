"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import "katex/dist/katex.min.css";
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
  Upload,
  FileJson,
  Lightbulb,
  AlignLeft,
  Bold,
  Italic,
  Heading,
  Eye,
  PenLine,
  Sigma,
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
  deleteQuestionImage,
  getLessonQuestions,
  bulkCreateQuestions,
} from "@/api/question";
import { downloadFile } from "@/api/files";
import { Track } from "@/types/track";
import { Subject } from "@/types/courses";
import {
  formatQuestionTitle,
  getQuestionClassifyItems,
  getQuestionCorrectMatch,
  getQuestionOptions,
  getQuestionTrueFalseAnswer,
  QUESTION_BLANK_MARKER,
  Question,
  QuestionType,
  BulkQuestionInput,
  QuestionOptionGroupInput,
  QuestionMatchItemInput,
  QuestionFillBlankInput,
  QuestionOrderItemInput,
  ClassifyItemInput,
} from "@/types/question";
import { ApiError } from "@/lib/errors";

if (typeof window !== "undefined") {
  (window as Window & { katex?: typeof katex }).katex = katex;
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

function hasTextContent(value: string): boolean {
  return !!value && value.trim().length > 0;
}

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
  fillBlanks: {
    label: "ملء الفراغات",
    className: "bg-teal-100 text-teal-700 border-teal-200",
  },
  order: {
    label: "ترتيب",
    className: "bg-orange-100 text-orange-600 border-orange-200",
  },
  classify: {
    label: "تصنيف",
    className: "bg-pink-100 text-pink-600 border-pink-200",
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

type FillBlankDirection = "rtl" | "ltr";

interface FillBlankRow {
  index: number;
  answers: string[];
  contentLength: string;
  hint: string;
  textDirection: FillBlankDirection;
  width: number;
}

interface OrderRow {
  text: string;
}

interface ClassifyCategoryRow {
  text: string;
}

interface ClassifyItemRow {
  text: string;
  categoryIndex: number | null;
}

const TEXT_FIELD_TOKEN_PATTERN = /\*?\{\{textField:\s*\{([^{}]*)\}\}\}\*?/g;

function parseTextFieldProperties(value: string): Record<string, string> {
  return Object.fromEntries(
    value.split(",").flatMap((property) => {
      const separator = property.indexOf(":");
      if (separator === -1) return [];
      return [
        [
          property.slice(0, separator).trim(),
          property.slice(separator + 1).trim(),
        ],
      ];
    }),
  );
}

// ============================================================================
// ============================================================================
export function formatTitleForDisplay(
  title: string,
  type: QuestionType | string,
): string {
  if (!title) return "";

  if (type === "fillBlanks") {
    return title.replace(TEXT_FIELD_TOKEN_PATTERN, (match, propertiesStr) => {
      const props = parseTextFieldProperties(propertiesStr);
      let hintText = "";

      if (
        props.hint &&
        props.hint !== "null" &&
        props.hint !== '""' &&
        props.hint !== "''"
      ) {
        const cleanHint = props.hint.replace(/^\\?["']|\\?["']$/g, "").trim();
        if (cleanHint) {
          hintText = ` (تلميح: ${cleanHint})`;
        }
      }

      return ` **__________${hintText}** `;
    });
  }

  return formatQuestionTitle(title);
}

function getFillBlankAuthoringState(question: Question | null): {
  title: string;
  rows: FillBlankRow[];
} | null {
  if (!question || question.type !== "fillBlanks") return null;

  const rows: FillBlankRow[] = [];
  const title = question.title.replace(
    TEXT_FIELD_TOKEN_PATTERN,
    (_token, serializedProperties: string) => {
      const properties = parseTextFieldProperties(serializedProperties);
      const parsedIndex = Number(properties.index);
      const index =
        Number.isInteger(parsedIndex) && parsedIndex >= 0
          ? parsedIndex
          : rows.length;
      const parsedWidth = Number(properties.width);
      const answer = question.fillBlanks?.find((item) => item.index === index);

      rows.push({
        index,
        answers: answer?.answers.length ? [...answer.answers] : [""],
        contentLength:
          properties.contentLength && properties.contentLength !== "null"
            ? properties.contentLength
            : "",
        hint:
          properties.hint && properties.hint.toLowerCase() !== "null"
            ? properties.hint.replace(/^(["'])(.*)\1$/, "$2")
            : "",
        textDirection:
          (
            properties.textDirection ?? properties.TextDirection
          )?.toLowerCase() === "ltr"
            ? "ltr"
            : "rtl",
        width:
          Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : 80,
      });

      return QUESTION_BLANK_MARKER;
    },
  );

  return { title, rows };
}

function countBlankMarkers(value: string): number {
  return value.split(QUESTION_BLANK_MARKER).length - 1;
}

function serializeFillBlankTitle(value: string, rows: FillBlankRow[]): string {
  const parts = value.split(QUESTION_BLANK_MARKER);

  return parts
    .map((part, position) => {
      const row = rows[position];
      if (!row) return part;

      const contentLength = row.contentLength.trim() || "null";

      const trimmedHint = row.hint.trim();
      const hint = trimmedHint ? `\"${trimmedHint}\"` : "null";

      const token = `{{textField: {index: ${row.index}, width: ${row.width}, textDirection: ${row.textDirection}, hint: ${hint}, contentLength: ${contentLength}}}}`;

      return `${part}${token}`;
    })
    .join("")
    .trim();
}

function removeBlankMarker(value: string, position: number): string {
  let currentPosition = 0;

  return value.replaceAll(QUESTION_BLANK_MARKER, (marker) => {
    const shouldRemove = currentPosition === position;
    currentPosition += 1;
    return shouldRemove ? "" : marker;
  });
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

// --- Bulk Import Parsing and Dialog Component ---
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredText(value: unknown, fieldLabel: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldLabel}: يجب إدخال نص غير فارغ`);
  }
  return value;
}

function getOptionalTips(value: unknown, label: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`${label}: يجب أن تكون النصائح مصفوفة نصية`);
  }
  return value.map((tip, index) =>
    getRequiredText(tip, `${label}: النصيحة رقم ${index + 1}`),
  );
}

function getOptionGroups(
  value: unknown,
  label: string,
): QuestionOptionGroupInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label}: يجب إضافة مجموعة خيارات واحدة على الأقل`);
  }

  return value.map((group, groupIndex) => {
    if (!isRecord(group)) {
      throw new Error(
        `${label}: مجموعة الخيارات رقم ${groupIndex + 1} غير صالحة`,
      );
    }
    if (!Number.isInteger(group.index) || (group.index as number) < 0) {
      throw new Error(`${label}: يجب تحديد index صالح لكل مجموعة خيارات`);
    }
    if (!Array.isArray(group.options) || group.options.length < 2) {
      throw new Error(
        `${label}: يجب أن تحتوي مجموعة الخيارات رقم ${groupIndex + 1} على خيارين على الأقل`,
      );
    }

    const options = group.options.map((option, optionIndex) => {
      if (!isRecord(option)) {
        throw new Error(
          `${label}: الخيار رقم ${optionIndex + 1} في المجموعة ${groupIndex + 1} غير صالح`,
        );
      }
      const text = getRequiredText(
        option.text,
        `${label}: نص الخيار رقم ${optionIndex + 1}`,
      );
      if (typeof option.isCorrect !== "boolean") {
        throw new Error(
          `${label}: يجب تحديد isCorrect للخيار رقم ${optionIndex + 1}`,
        );
      }
      return { text, isCorrect: option.isCorrect };
    });

    if (options.filter((option) => option.isCorrect).length !== 1) {
      throw new Error(
        `${label}: يجب تحديد إجابة صحيحة واحدة لكل مجموعة خيارات`,
      );
    }

    return {
      ...(typeof group.title === "string" && group.title.trim()
        ? { title: group.title }
        : {}),
      index: group.index as number,
      options,
    };
  });
}

function getMatchingItems(
  value: unknown,
  label: string,
): QuestionMatchItemInput[] {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error(`${label}: يجب إضافة ثلاثة عناصر توصيل على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر التوصيل رقم ${index + 1} غير صالح`);
    }
    if (item.type !== "base" && item.type !== "match") {
      throw new Error(
        `${label}: نوع عنصر التوصيل رقم ${index + 1} يجب أن يكون base أو match`,
      );
    }
    const text = getRequiredText(
      item.text,
      `${label}: نص عنصر التوصيل رقم ${index + 1}`,
    );
    if (
      item.correctIndex !== undefined &&
      (!Number.isInteger(item.correctIndex) ||
        (item.correctIndex as number) < 0)
    ) {
      throw new Error(
        `${label}: correctIndex غير صالح في عنصر التوصيل رقم ${index + 1}`,
      );
    }

    return {
      text,
      type: item.type,
      ...(item.correctIndex !== undefined
        ? { correctIndex: item.correctIndex as number }
        : {}),
    };
  });
}

function getFillBlanks(
  value: unknown,
  label: string,
): QuestionFillBlankInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label}: يجب إضافة فراغ واحد على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: إعداد الفراغ رقم ${index + 1} غير صالح`);
    }
    if (!Number.isInteger(item.index) || (item.index as number) < 0) {
      throw new Error(`${label}: يجب تحديد index صالح لكل فراغ`);
    }
    if (!Array.isArray(item.answers) || item.answers.length === 0) {
      throw new Error(`${label}: يجب إضافة إجابة واحدة على الأقل لكل فراغ`);
    }

    return {
      index: item.index as number,
      answers: item.answers.map((answer, answerIndex) =>
        getRequiredText(
          answer,
          `${label}: إجابة الفراغ ${index + 1} رقم ${answerIndex + 1}`,
        ),
      ),
    };
  });
}

function getOrders(value: unknown, label: string): QuestionOrderItemInput[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`${label}: يجب إضافة عنصرين للترتيب على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر الترتيب رقم ${index + 1} غير صالح`);
    }
    return {
      text: getRequiredText(
        item.text,
        `${label}: نص عنصر الترتيب رقم ${index + 1}`,
      ),
    };
  });
}

function getClassifyItems(value: unknown, label: string): ClassifyItemInput[] {
  if (!Array.isArray(value) || value.length < 4) {
    throw new Error(`${label}: يجب إضافة تصنيفين وعنصرين على الأقل`);
  }

  const items = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر التصنيف رقم ${index + 1} غير صالح`);
    }
    if (item.type !== "category" && item.type !== "item") {
      throw new Error(
        `${label}: نوع عنصر التصنيف رقم ${index + 1} يجب أن يكون category أو item`,
      );
    }
    const text = getRequiredText(
      item.text,
      `${label}: نص عنصر التصنيف رقم ${index + 1}`,
    );

    if (item.type === "category") return { text, type: "category" as const };

    if (
      !Number.isInteger(item.correctCategoryIndex) ||
      (item.correctCategoryIndex as number) < 0
    ) {
      throw new Error(
        `${label}: يجب تحديد correctCategoryIndex صالح للعنصر رقم ${index + 1}`,
      );
    }
    return {
      text,
      type: "item" as const,
      correctCategoryIndex: item.correctCategoryIndex as number,
    };
  });

  const categories = items.filter((item) => item.type === "category");
  const classifyItems = items.filter((item) => item.type === "item");
  if (categories.length < 2 || classifyItems.length < 2) {
    throw new Error(`${label}: يجب إضافة تصنيفين وعنصرين على الأقل`);
  }
  if (
    classifyItems.some(
      (item) => (item.correctCategoryIndex ?? 0) >= categories.length,
    )
  ) {
    throw new Error(`${label}: correctCategoryIndex يشير إلى تصنيف غير موجود`);
  }

  return items;
}

function parseBulkQuestions(
  text: string,
  courseId: string,
): BulkQuestionInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("ملف غير صالح: يجب أن يكون بصيغة JSON");
  }

  const questions = isRecord(parsed) ? parsed.questions : undefined;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("يجب أن يحتوي الملف على مصفوفة questions غير فارغة");
  }

  return questions.map((q, i) => {
    const label = `السؤال رقم ${i + 1}`;
    if (!isRecord(q)) {
      throw new Error(`${label}: تنسيق السؤال غير صالح`);
    }
    const item = q;

    const title = getRequiredText(item.title, `${label}: نص السؤال`);
    const tips = getOptionalTips(item.tips, label);
    const base = {
      title,
      courseId,
      purpose: "dailyChallenge" as const,
      ...(tips ? { tips } : {}),
    };

    if (item.type === "options") {
      return {
        ...base,
        type: "options",
        optionGroups: getOptionGroups(
          item.optionGroups ??
            (Array.isArray(item.options)
              ? [{ index: 0, options: item.options }]
              : undefined),
          label,
        ),
      };
    }

    if (item.type === "match") {
      return {
        ...base,
        type: "match",
        matchingItems: getMatchingItems(item.matchingItems, label),
      };
    }

    if (item.type === "trueFalse") {
      if (typeof item.correctAnswer !== "boolean") {
        throw new Error(`${label}: يجب تحديد الإجابة الصحيحة (true أو false)`);
      }
      return {
        ...base,
        type: "trueFalse",
        correctAnswer: item.correctAnswer,
      };
    }

    if (item.type === "fillBlanks") {
      return {
        ...base,
        type: "fillBlanks",
        fillBlanks: getFillBlanks(item.fillBlanks, label),
      };
    }

    if (item.type === "order") {
      return {
        ...base,
        type: "order",
        orders: getOrders(item.orders, label),
      };
    }

    if (item.type === "classify") {
      return {
        ...base,
        type: "classify",
        classify: getClassifyItems(item.classify, label),
      };
    }

    throw new Error(`${label}: نوع السؤال غير مدعوم`);
  });
}

function BulkImportDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Subject[]>([]);
  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    if (!trackId) return;
    getSchoolCourses(trackId)
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [trackId]);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) {
      setFormError("يجب اختيار المسار والمادة");
      return;
    }
    if (!file) {
      setFormError("يرجى اختيار ملف JSON");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const text = await file.text();
      const questions = parseBulkQuestions(text, courseId);
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
                  setCoursesLoading(Boolean(e.target.value));
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
              يجب أن يحتوي الملف على مصفوفة questions. تُدعم الأنواع options و
              match و trueFalse و fillBlanks و order و classify. سيتم تجاهل
              purpose و courseId داخل الملف واستخدام المادة المحددة وتحدي يومي
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

// -------------------------------------------------------------

function QuestionFormDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Question | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialFillBlankState = getFillBlankAuthoringState(editing);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Subject[]>([]);
  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState(editing?.courseId ?? "");
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [title, setTitle] = useState(
    initialFillBlankState?.title ?? editing?.title ?? "",
  );
  const [type, setType] = useState<QuestionType>(editing?.type ?? "options");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [options, setOptions] = useState<OptionRow[]>(() => {
    if (
      editing &&
      editing.type === "options" &&
      editing.optionsGroups.length > 0
    ) {
      return getQuestionOptions(editing).map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      }));
    }
    return [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];
  });
  const [optionGroupTitle, setOptionGroupTitle] = useState(() => {
    if (editing?.type === "options") {
      const group = editing.optionsGroups.find((item) => "options" in item);
      if (group) return group.text;
    }
    return "المجموعة الأولى";
  });
  const [bases, setBases] = useState<BaseRow[]>(() => {
    if (editing && editing.type === "match") {
      const matchItems = editing.matchingItems.filter(
        (m) => m.type === "match",
      );
      const baseItems = editing.matchingItems.filter((m) => m.type === "base");
      if (baseItems.length > 0) {
        return baseItems.map((b) => {
          const correctMatch = getQuestionCorrectMatch(b, matchItems);
          const matchIndex = matchItems.findIndex(
            (item) => item.id === correctMatch?.id,
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
    editing?.type === "trueFalse"
      ? (getQuestionTrueFalseAnswer(editing) ?? true)
      : true,
  );
  const [fillBlanks, setFillBlanks] = useState<FillBlankRow[]>(
    initialFillBlankState?.rows ?? [],
  );
  const [orders, setOrders] = useState<OrderRow[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  const [classifyCategories, setClassifyCategories] = useState<
    ClassifyCategoryRow[]
  >([{ text: "" }, { text: "" }]);
  const [classifyItems, setClassifyItems] = useState<ClassifyItemRow[]>([
    { text: "", categoryIndex: null },
    { text: "", categoryIndex: null },
  ]);
  const [tips, setTips] = useState<string[]>(() =>
    editing?.tips && editing.tips.length > 0 ? editing.tips : [""],
  );

  const [verdictText, setVerdictText] = useState(editing?.verdictText ?? "");

  useEffect(() => {
    if (editing) return;
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, [editing]);

  useEffect(() => {
    if (editing || !trackId) return;
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
    setFormError(null);
    setImageFile(file);
    setImagePreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return file ? URL.createObjectURL(file) : null;
    });
    if (file) setImageRemoved(false);
    if (!file && imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleRemoveImage(e?: React.MouseEvent) {
    e?.stopPropagation();
    setImageFile(null);
    setImagePreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    setImageRemoved(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function switchType(next: QuestionType) {
    if (next === type) return;
    setType(next);
    setFormError(null);
  }

  function insertMarkdown(prefix: string, suffix: string = "") {
    const textarea = titleTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = title.substring(start, end);
    const newTitle =
      title.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      title.substring(end);

    setTitle(newTitle);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length,
      );
    }, 0);
  }

  function insertFillBlank() {
    const textarea = titleTextareaRef.current;

    if (textarea && !previewMode) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newTitle =
        title.substring(0, start) +
        QUESTION_BLANK_MARKER +
        title.substring(end);

      setTitle(newTitle);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + QUESTION_BLANK_MARKER.length,
          start + QUESTION_BLANK_MARKER.length,
        );
      }, 0);
    } else {
      setTitle((currentTitle) => `${currentTitle}${QUESTION_BLANK_MARKER}`);
    }
    setFillBlanks((currentRows) => [
      ...currentRows,
      {
        index: currentRows.length,
        answers: [""],
        contentLength: "",
        hint: "",
        textDirection: "rtl",
        width: 80,
      },
    ]);
  }

  function deleteFillBlank(position: number) {
    const removedIndex = fillBlanks[position]?.index;
    setTitle((currentTitle) => removeBlankMarker(currentTitle, position));
    setFillBlanks((currentRows) =>
      currentRows
        .filter((_, rowPosition) => rowPosition !== position)
        .map((row) => ({
          ...row,
          index:
            removedIndex !== undefined && row.index > removedIndex
              ? row.index - 1
              : row.index,
        })),
    );
  }

  function changeFillBlankIndex(position: number, nextIndex: number) {
    setFillBlanks((currentRows) => {
      const currentIndex = currentRows[position].index;
      return currentRows.map((row, rowPosition) => {
        if (rowPosition === position) return { ...row, index: nextIndex };
        if (row.index === nextIndex) return { ...row, index: currentIndex };
        return row;
      });
    });
  }

  function validate(): string | null {
    if (!editing && !courseId) return "يجب اختيار المسار والمادة";
    if (!hasTextContent(title)) return "يجب إدخال نص السؤال";

    if (editing) {
      if (
        type === "fillBlanks" &&
        countBlankMarkers(title) !== fillBlanks.length
      )
        return "لا تحذف خط الفراغ يدوياً؛ استخدم زر حذف الفراغ";
      return null;
    }

    if (type === "options") {
      if (!hasTextContent(optionGroupTitle))
        return "يجب إدخال اسم مجموعة الخيارات";
      if (options.length < 2) return "يجب إضافة خيارين على الأقل";
      if (options.some((option) => !hasTextContent(option.text)))
        return "أدخل نص جميع الخيارات";
      if (options.filter((o) => o.isCorrect).length === 0)
        return "يجب تحديد إجابة صحيحة واحدة على الأقل";
      return null;
    }

    if (type === "match") {
      if (bases.length < 1) return "أضف عنصراً أساسياً واحداً على الأقل";
      if (bases.length + matches.length < 3)
        return "يجب ألا يقل عدد عناصر التوصيل عن 3";
      if (matches.length < bases.length)
        return "عدد الإجابات يجب ألا يقل عن عدد العناصر الأساسية";
      if (
        bases.some((base) => !hasTextContent(base.text)) ||
        matches.some((match) => !hasTextContent(match.text))
      )
        return "أدخل نص جميع عناصر التوصيل";
      if (bases.some((base) => base.matchIndex === null))
        return "اختر الإجابة الصحيحة لكل عنصر أساسي";
      const used = bases.map((base) => base.matchIndex);
      if (new Set(used).size !== used.length)
        return "لا يمكن ربط عنصرين أساسيين بنفس الإجابة";
      return null;
    }

    if (type === "fillBlanks") {
      if (fillBlanks.length < 1) return "أضف فراغاً واحداً على الأقل";
      if (countBlankMarkers(title) !== fillBlanks.length)
        return "عدد الفراغات في نص السؤال لا يطابق إعدادات الفراغات";
      if (
        fillBlanks.some(
          (blank) =>
            blank.answers.length < 1 ||
            blank.answers.some((answer) => !hasTextContent(answer)),
        )
      )
        return "أدخل جميع الإجابات المقبولة للفراغات";
      if (
        fillBlanks.some(
          (blank) =>
            !Number.isInteger(blank.index) ||
            blank.index < 0 ||
            blank.index >= fillBlanks.length,
        )
      )
        return "اختر رقماً صحيحاً لكل فراغ";
      if (
        new Set(fillBlanks.map((blank) => blank.index)).size !==
        fillBlanks.length
      )
        return "يجب أن يكون رقم كل فراغ مختلفاً";
      if (
        fillBlanks.some(
          (blank) =>
            blank.contentLength.trim() !== "" &&
            (!Number.isInteger(Number(blank.contentLength)) ||
              Number(blank.contentLength) < 1),
        )
      )
        return "عدد الأحرف يجب أن يكون رقماً صحيحاً أكبر من صفر";
      if (fillBlanks.some((blank) => /[,{}]/.test(blank.hint.trim())))
        return "تلميح الفراغ لا يمكن أن يحتوي على فاصلة أو أقواس معقوفة";
      return null;
    }

    if (type === "order") {
      if (orders.length < 2) return "يجب إضافة عنصرين للترتيب على الأقل";
      if (orders.some((order) => !hasTextContent(order.text)))
        return "أدخل نص جميع عناصر الترتيب";
      return null;
    }

    if (type === "classify") {
      if (classifyCategories.length < 2) return "أضف تصنيفين على الأقل";
      if (classifyItems.length < 2) return "أضف عنصرين للتصنيف على الأقل";
      if (classifyCategories.some((category) => !hasTextContent(category.text)))
        return "أدخل نص جميع التصنيفات";
      if (classifyItems.some((item) => !hasTextContent(item.text)))
        return "أدخل نص جميع العناصر";
      if (classifyItems.some((item) => item.categoryIndex === null))
        return "اختر تصنيفاً لكل عنصر";
      return null;
    }

    return null;
  }

  function buildOptionGroupInputs() {
    return [
      {
        title: optionGroupTitle.trim(),
        index: 0,
        options: options.map((option) => ({
          text: option.text.trim(),
          isCorrect: option.isCorrect,
        })),
      },
    ];
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

  function buildFillBlanksInputs() {
    return fillBlanks
      .map((blank) => ({
        index: blank.index,
        answers: blank.answers.map((answer) => answer.trim()).filter(Boolean),
      }))
      .sort((a, b) => a.index - b.index);
  }

  function buildOrderInputs() {
    return orders.map((order) => ({ text: order.text.trim() }));
  }

  function buildClassifyInputs() {
    const categories = classifyCategories.map((category) => ({
      text: category.text.trim(),
      type: "category" as const,
    }));
    const items = classifyItems.map((item) => ({
      text: item.text.trim(),
      type: "item" as const,
      correctCategoryIndex: item.categoryIndex as number,
    }));
    return [...categories, ...items];
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
    const tipsPayload = tips.filter(hasTextContent).map((tip) => tip.trim());
    const titlePayload =
      type === "fillBlanks"
        ? serializeFillBlankTitle(title, fillBlanks)
        : title.trim();

    const verdictTextPayload = hasTextContent(verdictText)
      ? verdictText.trim()
      : undefined;

    try {
      if (editing) {
        if (imageRemoved && !imageFile && editing.imageId) {
          await deleteQuestionImage(editing.id);
        }
        await updateQuestion(editing.id, {
          title: titlePayload,
          tips: tipsPayload,
          ...(imageFile ? { image: imageFile } : {}),
        });
      } else {
        await createQuestion({
          title: titlePayload,
          type,
          courseId,
          purpose: "dailyChallenge",
          tips: tipsPayload,
          verdictText: verdictTextPayload,
          ...(imageFile ? { image: imageFile } : {}),
          ...(type === "options"
            ? { optionGroups: buildOptionGroupInputs() }
            : {}),
          ...(type === "match" ? { matchingItems: buildMatchInputs() } : {}),
          ...(type === "trueFalse" ? { correctAnswer: trueFalseAnswer } : {}),
          ...(type === "fillBlanks"
            ? { fillBlanks: buildFillBlanksInputs() }
            : {}),
          ...(type === "order" ? { orders: buildOrderInputs() } : {}),
          ...(type === "classify" ? { classify: buildClassifyInputs() } : {}),
        });
      }
      onSaved();
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir="rtl"
        className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="pt-2 text-xl">
            {editing ? "تعديل السؤال" : "إضافة سؤال جديد"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
        >
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
                    setCoursesLoading(Boolean(e.target.value));
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

          {!editing && (
            <div className="space-y-3">
              <Label>نوع السؤال</Label>
              <div className="flex flex-wrap gap-2">
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
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="question-title">نص السؤال</Label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    !previewMode
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" /> تعديل
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    previewMode
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> معاينة
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
                  id="question-title"
                  ref={titleTextareaRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === "fillBlanks"
                      ? `اكتب نص السؤال ثم أضف ${QUESTION_BLANK_MARKER} في موضع كل إجابة`
                      : "اكتب نص السؤال واستخدم أدوات التنسيق العلوية..."
                  }
                  className="min-h-[120px] w-full resize-y bg-transparent px-3 py-3 text-sm placeholder:text-right placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  dir="auto"
                />
              </div>
            ) : (
              <div className="min-h-[160px] w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm shadow-inner">
                {title ? (
                  <DisplayText value={formatTitleForDisplay(title, type)} />
                ) : (
                  <span className="italic text-slate-400">
                    لا يوجد نص لمعاينته...
                  </span>
                )}
              </div>
            )}
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
              {imagePreview || (editing?.imageId && !imageRemoved) ? (
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="معاينة صورة السؤال"
                      className="max-h-40 rounded-lg border border-slate-200"
                    />
                  ) : (
                    <FileImage
                      fileId={editing!.imageId!}
                      alt="صورة السؤال الحالية"
                      className="max-h-40 rounded-lg border border-slate-200"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -left-2 h-7 w-7 p-0 rounded-full bg-white text-red-500 hover:text-red-600 shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
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

          {!editing && type === "options" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="option-group-title">اسم مجموعة الخيارات</Label>
                <Input
                  id="option-group-title"
                  value={optionGroupTitle}
                  onChange={(e) => setOptionGroupTitle(e.target.value)}
                  placeholder="اسم مجموعة الخيارات"
                  className="bg-white"
                />
              </div>
              <Label>الخيارات (حدد الإجابة الصحيحة)</Label>
              {options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-blue-600 rounded border-slate-300"
                    checked={option.isCorrect}
                    onChange={(e) => {
                      setOptions((prev) =>
                        prev.map((o, j) =>
                          j === i ? { ...o, isCorrect: e.target.checked } : o,
                        ),
                      );
                    }}
                  />
                  <Input
                    value={option.text}
                    placeholder={`الخيار ${i + 1}`}
                    className="flex-1 bg-white"
                    onChange={(e) => {
                      setOptions((prev) =>
                        prev.map((o, j) =>
                          j === i ? { ...o, text: e.target.value } : o,
                        ),
                      );
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
                }}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة خيار
              </Button>
            </div>
          )}

          {!editing && type === "match" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                        className="flex-1 bg-white"
                        onChange={(e) => {
                          setBases((prev) =>
                            prev.map((b, j) =>
                              j === i ? { ...b, text: e.target.value } : b,
                            ),
                          );
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
                      className="flex-1 bg-white"
                      onChange={(e) => {
                        setMatches((prev) =>
                          prev.map((m, j) =>
                            j === i ? { text: e.target.value } : m,
                          ),
                        );
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
                  }}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة إجابة
                </Button>
              </div>
            </div>
          )}

          {!editing && type === "trueFalse" && (
            <div className="space-y-3">
              <Label>الإجابة الصحيحة</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={trueFalseAnswer ? "default" : "outline"}
                  className="h-10 flex-1"
                  onClick={() => setTrueFalseAnswer(true)}
                >
                  صح
                </Button>
                <Button
                  type="button"
                  variant={!trueFalseAnswer ? "default" : "outline"}
                  className="h-10 flex-1"
                  onClick={() => setTrueFalseAnswer(false)}
                >
                  خطأ
                </Button>
              </div>
            </div>
          )}

          {type === "fillBlanks" && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="bg-blue-50/50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm leading-relaxed">
                <p className="font-bold mb-2 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> إنشاء سؤال ملء الفراغات
                </p>
                {editing ? (
                  <p>
                    يمكنك تعديل اتجاه الكتابة، وعدد الأحرف، وتلميح كل فراغ.
                    الإجابات وأرقامها لا تتغير من شاشة التعديل.
                  </p>
                ) : (
                  <>
                    <p>
                      ضع المؤشر داخل نص السؤال، ثم اضغط <b>إضافة فراغ</b>. سيظهر
                      خط فارغ هنا، بينما يُرسل التنسيق المطلوب إلى الخادم
                      تلقائياً.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertFillBlank}
                      className="mt-3 bg-white"
                    >
                      <Plus className="h-4 w-4 ml-1" /> إضافة فراغ عند موضع
                      المؤشر
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <Label>إعدادات الفراغات والإجابات</Label>
                {fillBlanks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-500">
                    لم تتم إضافة أي فراغ بعد.
                  </p>
                )}
                {fillBlanks.map((blank, blankPosition) => (
                  <div
                    key={blankPosition}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">
                        الفراغ {blankPosition + 1}
                      </p>
                      {!editing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFillBlank(blankPosition)}
                          aria-label={`حذف الفراغ ${blankPosition + 1}`}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`fill-blank-index-${blankPosition}`}>
                          رقم الإجابة
                        </Label>
                        <select
                          id={`fill-blank-index-${blankPosition}`}
                          className={selectClassName}
                          value={blank.index}
                          disabled={!!editing}
                          onChange={(event) =>
                            changeFillBlankIndex(
                              blankPosition,
                              Number(event.target.value),
                            )
                          }
                        >
                          {fillBlanks.map((_, index) => (
                            <option key={index} value={index}>
                              {index}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`fill-blank-direction-${blankPosition}`}
                        >
                          اتجاه الكتابة
                        </Label>
                        <select
                          id={`fill-blank-direction-${blankPosition}`}
                          className={selectClassName}
                          value={blank.textDirection}
                          onChange={(event) =>
                            setFillBlanks((currentRows) =>
                              currentRows.map((row, position) =>
                                position === blankPosition
                                  ? {
                                      ...row,
                                      textDirection: event.target
                                        .value as FillBlankDirection,
                                    }
                                  : row,
                              ),
                            )
                          }
                        >
                          <option value="rtl">من اليمين إلى اليسار</option>
                          <option value="ltr">من اليسار إلى اليمين</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fill-blank-length-${blankPosition}`}>
                          عدد الأحرف المسموح بها
                        </Label>
                        <Input
                          id={`fill-blank-length-${blankPosition}`}
                          type="number"
                          min={1}
                          step={1}
                          dir="ltr"
                          value={blank.contentLength}
                          placeholder="غير محدد"
                          onChange={(event) =>
                            setFillBlanks((currentRows) =>
                              currentRows.map((row, position) =>
                                position === blankPosition
                                  ? {
                                      ...row,
                                      contentLength: event.target.value,
                                    }
                                  : row,
                              ),
                            )
                          }
                        />
                        <p className="text-[11px] text-slate-400">
                          اتركه فارغاً لإرسال قيمة غير محددة.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fill-blank-hint-${blankPosition}`}>
                        تلميح الفراغ (اختياري)
                      </Label>
                      <Input
                        id={`fill-blank-hint-${blankPosition}`}
                        dir={blank.textDirection}
                        value={blank.hint}
                        placeholder="مثال: اكتب اسم العاصمة"
                        onChange={(event) =>
                          setFillBlanks((currentRows) =>
                            currentRows.map((row, position) =>
                              position === blankPosition
                                ? { ...row, hint: event.target.value }
                                : row,
                            ),
                          )
                        }
                      />
                      <p className="text-[11px] text-slate-400">
                        اتركه فارغاً لإرسال hint: null.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>الإجابات المقبولة</Label>
                      {blank.answers.map((answer, answerIndex) => (
                        <div
                          key={answerIndex}
                          className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              htmlFor={`fill-blank-${blankPosition}-answer-${answerIndex}`}
                              className="text-xs"
                            >
                              {answerIndex === 0
                                ? "الإجابة الأساسية"
                                : `الإجابة البديلة ${answerIndex}`}
                            </Label>
                            {!editing && blank.answers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-red-500"
                                aria-label={`حذف الإجابة ${answerIndex + 1}`}
                                onClick={() =>
                                  setFillBlanks((currentRows) =>
                                    currentRows.map((row, position) =>
                                      position === blankPosition
                                        ? {
                                            ...row,
                                            answers: row.answers.filter(
                                              (_, positionToRemove) =>
                                                positionToRemove !==
                                                answerIndex,
                                            ),
                                          }
                                        : row,
                                    ),
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            id={`fill-blank-${blankPosition}-answer-${answerIndex}`}
                            dir={blank.textDirection}
                            value={answer}
                            disabled={!!editing}
                            placeholder={
                              answerIndex === 0 ? "مثال: باريس" : "مثال: Paris"
                            }
                            onChange={(event) =>
                              setFillBlanks((currentRows) =>
                                currentRows.map((row, position) =>
                                  position === blankPosition
                                    ? {
                                        ...row,
                                        answers: row.answers.map(
                                          (currentAnswer, currentIndex) =>
                                            currentIndex === answerIndex
                                              ? event.target.value
                                              : currentAnswer,
                                        ),
                                      }
                                    : row,
                                ),
                              )
                            }
                          />
                        </div>
                      ))}
                      {!editing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFillBlanks((currentRows) =>
                              currentRows.map((row, position) =>
                                position === blankPosition
                                  ? { ...row, answers: [...row.answers, ""] }
                                  : row,
                              ),
                            )
                          }
                        >
                          <Plus className="ml-1 h-4 w-4" /> إضافة إجابة بديلة
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={insertFillBlank}
                  >
                    <Plus className="h-4 w-4 ml-1" /> إضافة فراغ آخر
                  </Button>
                )}
              </div>
            </div>
          )}

          {!editing && type === "order" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Label>
                العناصر المراد ترتيبها (قم بإدخالها بالترتيب الصحيح هنا)
              </Label>
              {orders.map((order, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <Input
                    value={order.text}
                    placeholder={`العنصر رقم ${index + 1}`}
                    className="flex-1 bg-white"
                    onChange={(event) =>
                      setOrders((currentOrders) =>
                        currentOrders.map((currentOrder, position) =>
                          position === index
                            ? { text: event.target.value }
                            : currentOrder,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={orders.length <= 2}
                    onClick={() =>
                      setOrders((currentOrders) =>
                        currentOrders.filter(
                          (_, position) => position !== index,
                        ),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setOrders((currentOrders) => [...currentOrders, { text: "" }])
                }
              >
                <Plus className="h-4 w-4 ml-1" /> إضافة عنصر ترتيب
              </Button>
            </div>
          )}

          {!editing && type === "classify" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-3">
                <Label>التصنيفات (المجموعات)</Label>
                {classifyCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={category.text}
                      placeholder={`اسم التصنيف ${index + 1}`}
                      className="flex-1 bg-white"
                      onChange={(event) =>
                        setClassifyCategories((currentCategories) =>
                          currentCategories.map((currentCategory, position) =>
                            position === index
                              ? { text: event.target.value }
                              : currentCategory,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={classifyCategories.length <= 2}
                      onClick={() => {
                        setClassifyCategories((currentCategories) =>
                          currentCategories.filter(
                            (_, position) => position !== index,
                          ),
                        );
                        setClassifyItems((currentItems) =>
                          currentItems.map((item) => ({
                            ...item,
                            categoryIndex:
                              item.categoryIndex === index
                                ? null
                                : item.categoryIndex !== null &&
                                    item.categoryIndex > index
                                  ? item.categoryIndex - 1
                                  : item.categoryIndex,
                          })),
                        );
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
                  onClick={() =>
                    setClassifyCategories((currentCategories) => [
                      ...currentCategories,
                      { text: "" },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 ml-1" /> تصنيف جديد
                </Button>
              </div>

              <div className="space-y-3">
                <Label>العناصر المراد تصنيفها</Label>
                {classifyItems.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={item.text}
                        placeholder={`العنصر ${index + 1}`}
                        className="flex-1"
                        onChange={(event) =>
                          setClassifyItems((currentItems) =>
                            currentItems.map((currentItem, position) =>
                              position === index
                                ? { ...currentItem, text: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={classifyItems.length <= 2}
                        onClick={() =>
                          setClassifyItems((currentItems) =>
                            currentItems.filter(
                              (_, position) => position !== index,
                            ),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <select
                      className={selectClassName}
                      value={item.categoryIndex ?? ""}
                      onChange={(event) => {
                        const value =
                          event.target.value === ""
                            ? null
                            : Number(event.target.value);
                        setClassifyItems((currentItems) =>
                          currentItems.map((currentItem, position) =>
                            position === index
                              ? { ...currentItem, categoryIndex: value }
                              : currentItem,
                          ),
                        );
                      }}
                    >
                      <option value="">أين ينتمي هذا العنصر؟</option>
                      {classifyCategories.map((category, categoryIndex) => (
                        <option key={categoryIndex} value={categoryIndex}>
                          {category.text.trim() ||
                            `التصنيف ${categoryIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setClassifyItems((currentItems) => [
                      ...currentItems,
                      { text: "", categoryIndex: null },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 ml-1" /> عنصر جديد
                </Button>
              </div>
            </div>
          )}
          {/* حقل شرح الإجابة */}
          <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
            <Label htmlFor="verdict-text">
              شرح الإجابة / التفسير (اختياري)
            </Label>
            <textarea
              id="verdict-text"
              value={verdictText}
              onChange={(e) => setVerdictText(e.target.value)}
              placeholder="اكتب شرحاً يوضح سبب الإجابة الصحيحة لتظهر للطالب..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm placeholder:text-right focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px] resize-y"
              dir="auto"
            />
          </div>
          <div className="space-y-3 pt-2">
            <Label>نصائح (اختياري)</Label>
            {tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={tip}
                  placeholder={`نصيحة ${index + 1}`}
                  className="flex-1"
                  onChange={(event) =>
                    setTips((currentTips) =>
                      currentTips.map((currentTip, position) =>
                        position === index ? event.target.value : currentTip,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={tips.length <= 1}
                  onClick={() =>
                    setTips((currentTips) =>
                      currentTips.filter((_, position) => position !== index),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTips((currentTips) => [...currentTips, ""])}
            >
              <Plus className="h-4 w-4 ml-1" /> إضافة نصيحة
            </Button>
          </div>

          {formError && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {formError}
            </p>
          )}
        </form>

        <div className="flex gap-3 justify-end p-5 bg-white border-t border-slate-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 h-11"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 h-11 bg-blue-600 hover:bg-blue-700"
          >
            {submitting
              ? "جاري الحفظ..."
              : editing
                ? "حفظ التعديلات"
                : "إضافة السؤال"}
          </Button>
        </div>
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    getTracks()
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    if (!trackId) return;
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
    const timeoutId = window.setTimeout(fetchQuestions, 0);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, page]);

  const filteredQuestions = questions.filter((q) =>
    formatTitleForDisplay(q.title, q.type)
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            إدارة اسئلة التحدي اليوميه
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            اختر المسار والمادة لعرض أسئلتها
          </p>
        </div>

        {/* تم التعديل هنا */}
        <div className="flex flex-col md:flex-row w-full sm:w-auto gap-2">
          <Button
            className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white rounded-md px-6 h-10"
            onClick={() => setBulkOpen(true)}
          >
            استيراد أسئلة
            <Upload className="mr-2 h-4 w-4" />
          </Button>
          <Button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-10"
            onClick={() => {
              setEditingQuestion(null);
              setFormOpen(true);
            }}
          >
            إضافة سؤال
            <Plus className="mr-2 h-4 w-4" />
          </Button>
        </div>
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
                setCoursesLoading(Boolean(e.target.value));
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
            const orderItems = question.order ?? question.orderItems ?? [];
            const classifyItems = getQuestionClassifyItems(question);
            const correctMatchIds = new Set(
              baseItems
                .map((base) => getQuestionCorrectMatch(base, matchItems)?.id)
                .filter(Boolean),
            );
            const decoys = matchItems.filter(
              (match) => !correctMatchIds.has(match.id),
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
                      <DisplayText
                        value={formatTitleForDisplay(
                          question.title,
                          question.type,
                        )}
                        className="max-w-lg truncate font-bold text-slate-900"
                      />
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
                    className="border-t border-slate-100 pt-4 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DisplayText
                      value={formatTitleForDisplay(
                        question.title,
                        question.type,
                      )}
                      className="text-sm font-semibold leading-relaxed text-slate-700"
                    />

                    {question.imageId && (
                      <FileImage
                        fileId={question.imageId}
                        alt="Question image"
                        className="max-h-40 rounded-lg border border-slate-200"
                      />
                    )}

                    {question.type === "options" && (
                      <div className="space-y-2">
                        {getQuestionOptions(question).map((option) => (
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
                            <DisplayText
                              value={option.text}
                              className="flex-1 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "match" && (
                      <div className="space-y-2">
                        {[...baseItems]
                          .sort(
                            (a, b) =>
                              (a.index ?? Number.MAX_SAFE_INTEGER) -
                              (b.index ?? Number.MAX_SAFE_INTEGER),
                          )
                          .map((base) => {
                            const paired = getQuestionCorrectMatch(
                              base,
                              matchItems,
                            );
                            return (
                              <div
                                key={base.id}
                                className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-sm"
                              >
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                                  <span className="mb-1 block text-[11px] font-semibold text-slate-400">
                                    العنصر
                                  </span>
                                  <DisplayText value={base.text} />
                                </div>
                                <ArrowLeft className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                                  <span className="mb-1 block text-[11px] font-semibold text-emerald-500">
                                    الإجابة الصحيحة
                                  </span>
                                  <DisplayText
                                    value={paired?.text ?? "غير محددة"}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        {decoys.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>إجابات تمويه:</span>
                            {decoys.map((decoy) => (
                              <DisplayText
                                key={decoy.id}
                                value={decoy.text}
                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {question.type === "trueFalse" && (
                      <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        الإجابة الصحيحة:{" "}
                        {getQuestionTrueFalseAnswer(question) ? "صح" : "خطأ"}
                      </div>
                    )}

                    {question.type === "fillBlanks" && (
                      <div className="space-y-2">
                        {question.fillBlanks?.map((blank) => (
                          <div
                            key={blank.id || blank.index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-bold text-slate-500">
                              فراغ {blank.index}:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {blank.answers.map((answer, answerIndex) => (
                                <div
                                  key={answerIndex}
                                  className="flex items-center gap-2"
                                >
                                  {answerIndex > 0 && (
                                    <span className="text-slate-400">أو</span>
                                  )}
                                  <DisplayText
                                    value={answer}
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "order" && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {[...orderItems]
                          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                          .map((item, index) => (
                            <div
                              key={item.id ?? index}
                              className="flex items-center gap-2"
                            >
                              <DisplayText
                                value={item.text}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700"
                              />
                              {index < orderItems.length - 1 && (
                                <ArrowLeft className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {question.type === "classify" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {classifyItems
                          .filter((item) => item.type === "category")
                          .sort((a, b) => a.index - b.index)
                          .map((category) => (
                            <div
                              key={category.id}
                              className="border border-slate-200 rounded-xl p-3 bg-slate-50/50"
                            >
                              <DisplayText
                                value={category.text}
                                className="mb-2 border-b border-slate-200 pb-2 font-bold text-slate-800"
                              />
                              <ul className="space-y-1.5">
                                {classifyItems
                                  .filter(
                                    (item) =>
                                      item.type === "item" &&
                                      item.correctCategoryIndex ===
                                        category.index,
                                  )
                                  .map((item) => (
                                    <li
                                      key={item.id}
                                      className="text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                                    >
                                      <DisplayText value={item.text} />
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    )}

                    {question.tips && question.tips.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                        <p className="text-xs font-semibold text-slate-500">
                          نصائح
                        </p>
                        {question.tips.map((tip, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
                          >
                            <Lightbulb className="h-4 w-4 shrink-0" />
                            <DisplayText value={tip} className="flex-1" />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.verdictText && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                        <p className="text-xs font-semibold text-slate-500">
                          شرح الإجابة
                        </p>
                        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                          <Lightbulb className="h-4 w-4 shrink-0 text-blue-600" />
                          <DisplayText
                            value={question.verdictText}
                            className="flex-1"
                          />
                        </div>
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

      {/* Bulk Import Questions Dialog */}
      {bulkOpen && (
        <BulkImportDialog
          onClose={() => setBulkOpen(false)}
          onSaved={() => {
            setBulkOpen(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
