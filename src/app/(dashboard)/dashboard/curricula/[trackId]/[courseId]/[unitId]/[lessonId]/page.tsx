"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import katex from "katex";
import "react-quill-new/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import {
  ArrowRight,
  ArrowLeft,
  Edit2,
  X,
  Trash2,
  Plus,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Circle,
  Lock,
  ImageIcon,
  Lightbulb,
  AlignLeft,
  Upload,
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
import { EmptyState } from "@/components/ui/empty-state";
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
  formatQuestionTitle,
  getQuestionClassifyItems,
  getQuestionCorrectMatch,
  getQuestionTrueFalseAnswer,
  QUESTION_BLANK_MARKER,
  Question,
  QuestionType,
} from "@/types/question";
import { Lesson } from "@/types/lesson";
import { ApiError } from "@/lib/errors";
import { parseBulkQuestions } from "@/lib/bulk-questions";

if (typeof window !== "undefined") {
  (window as Window & { katex?: typeof katex }).katex = katex;
}

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as typeof import("react-quill-new").default;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ align: [] }, { direction: "rtl" }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["formula"],
    ["clean"],
  ],
};

type ReactQuillInstance = InstanceType<
  typeof import("react-quill-new").default
>;

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  direction?: "rtl" | "ltr";
  className?: string;
}

const RichTextEditor = forwardRef<ReactQuillInstance, RichTextEditorProps>(
  function RichTextEditor(
    {
      id,
      value,
      onChange,
      placeholder,
      readOnly = false,
      direction = "rtl",
      className = "",
    },
    ref,
  ) {
    return (
      <ReactQuill
        ref={ref}
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`relative min-w-0 overflow-visible rounded-lg border border-slate-200 bg-white 
          [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 
          [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-0 [&_.ql-editor]:min-h-20 
          /* --- إصلاح نافذة المعادلات (Tooltip) --- */
          [&_.ql-tooltip]:z-50 
          [&_.ql-tooltip]:!right-2 
          [&_.ql-tooltip]:!left-auto 
          [&_.ql-tooltip]:!transform-none 
          [&_.ql-tooltip]:max-w-[95%] 
          [&_.ql-tooltip]:whitespace-normal 
          [&_.ql-tooltip]:flex 
          [&_.ql-tooltip]:flex-wrap 
          [&_.ql-tooltip]:items-center 
          [&_.ql-tooltip]:gap-2 
          [&_.ql-tooltip_input]:!w-[130px] 
          sm:[&_.ql-tooltip_input]:!w-[170px]
          /* -------------------------------------- */
          ${
            direction === "ltr"
              ? "[&_.ql-editor]:[direction:ltr] [&_.ql-editor]:!text-left"
              : ""
          } ${className}`}
      />
    );
  },
);

function richTextToPlainText(value: string): string {
  return value
    .replace(
      /<span[^>]*class=["'][^"']*ql-formula[^"']*["'][^>]*data-value=["']([^"']*)["'][^>]*><\/span>/gi,
      "$1",
    )
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hasRichTextContent(value: string): boolean {
  return richTextToPlainText(value).length > 0 || /ql-formula/i.test(value);
}

function RichTextContent({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return <div className={`whitespace-pre-wrap ${className}`}>{value}</div>;
  }

  return (
    <div
      className={`ql-editor !min-h-0 !p-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
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

function formatError(e: unknown): string {
  if (e instanceof ApiError && e.code === "BAD_INPUT" && e.serverMessage) {
    return e.serverMessage;
  }
  return (e as Error).message;
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
      const questions = parseBulkQuestions(await file.text(), {
        purpose: "lesson",
        lessonId,
      });
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
          <DialogTitle className="pt-5">استيراد أسئلة الدرس من ملف JSON</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="lesson-bulk-file">ملف الأسئلة</Label>
            <input
              id="lesson-bulk-file"
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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
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
                    className="mt-1 text-xs text-red-500 hover:text-red-600"
                  >
                    إزالة الملف
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900">
                    اسحب ملف JSON هنا
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    أو انقر لاختيار ملف · يُقبل فقط ملفات json.
                  </p>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              يجب أن يحتوي الملف على مصفوفة questions. تُدعم الأنواع options و
              match و trueFalse و fillBlanks و order و classify. سيتم تجاهل
              purpose و lessonId داخل الملف وربط الأسئلة بهذا الدرس تلقائياً.
            </p>
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 p-4"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting} className="h-12 p-4">
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

// --- واجهات الأنواع ---
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
      const hint = richTextToPlainText(row.hint) || "null";
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
  const initialFillBlankState = getFillBlankAuthoringState(editing);
  const [title, setTitle] = useState(
    initialFillBlankState?.title ?? editing?.title ?? "",
  );
  const [type, setType] = useState<QuestionType>(editing?.type ?? "options");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const titleEditorRef = useRef<ReactQuillInstance>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- States لكل أنواع الأسئلة ---
  const [options, setOptions] = useState<OptionRow[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]);
  const [optionGroupTitle, setOptionGroupTitle] = useState("المجموعة الأولى");
  const [bases, setBases] = useState<BaseRow[]>([
    { text: "", matchIndex: null },
    { text: "", matchIndex: null },
  ]);
  const [matches, setMatches] = useState<MatchRow[]>([
    { text: "" },
    { text: "" },
  ]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);

  // أنواع جديدة
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
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    if (file) setImageRemoved(false);
    if (!file && imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleRemoveImage(e?: React.MouseEvent) {
    e?.stopPropagation();
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
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

  function insertFillBlank() {
    const editor = titleEditorRef.current?.getEditor();
    const insertionPoint =
      editor?.getSelection()?.index ??
      Math.max((editor?.getLength() ?? 1) - 1, 0);

    if (editor) {
      editor.insertText(insertionPoint, QUESTION_BLANK_MARKER, "user");
      editor.setSelection(insertionPoint + QUESTION_BLANK_MARKER.length, 0);
    } else {
      setTitle((currentTitle) => `${currentTitle}${QUESTION_BLANK_MARKER}`);
    }
    setFillBlanks((prev) => [
      ...prev,
      {
        index: prev.length,
        answers: [""],
        contentLength: "",
        hint: "",
        textDirection: "rtl",
        width: 80,
      },
    ]);

    requestAnimationFrame(() => titleEditorRef.current?.focus());
  }

  function deleteFillBlank(position: number) {
    const removedIndex = fillBlanks[position]?.index;
    setTitle((prev) => removeBlankMarker(prev, position));
    setFillBlanks((prev) =>
      prev
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
    setFillBlanks((prev) => {
      const currentIndex = prev[position].index;
      return prev.map((row, rowPosition) => {
        if (rowPosition === position) return { ...row, index: nextIndex };
        if (row.index === nextIndex) return { ...row, index: currentIndex };
        return row;
      });
    });
  }

  function validate(): string | null {
    if (!hasRichTextContent(title)) return "يجب إدخال نص السؤال";
    if (editing) {
      if (
        type === "fillBlanks" &&
        countBlankMarkers(title) !== fillBlanks.length
      )
        return "لا تحذف خط الفراغ يدوياً؛ استخدم زر حذف الفراغ";
      return null;
    }

    if (type === "options") {
      if (!hasRichTextContent(optionGroupTitle))
        return "يجب إدخال اسم مجموعة الخيارات";
      if (options.length < 2) return "يجب إضافة خيارين على الأقل";
      if (options.some((o) => !hasRichTextContent(o.text)))
        return "أدخل نص جميع الخيارات";
      if (options.filter((o) => o.isCorrect).length !== 1)
        return "يجب تحديد إجابة صحيحة واحدة";
      return null;
    }

    if (type === "match") {
      if (bases.length < 1) return "أضف عنصراً أساسياً واحداً على الأقل";
      if (bases.length + matches.length < 3)
        return "يجب ألا يقل عدد عناصر التوصيل عن 3";
      if (matches.length < bases.length)
        return "عدد الإجابات يجب ألا يقل عن عدد العناصر الأساسية";
      if (
        bases.some((b) => !hasRichTextContent(b.text)) ||
        matches.some((m) => !hasRichTextContent(m.text))
      )
        return "أدخل نص جميع عناصر التوصيل";
      if (bases.some((b) => b.matchIndex === null))
        return "اختر الإجابة الصحيحة لكل عنصر أساسي";
      const used = bases.map((b) => b.matchIndex);
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
          (fb) =>
            fb.answers.length < 1 ||
            fb.answers.some((answer) => !hasRichTextContent(answer)),
        )
      )
        return "أدخل جميع الإجابات المقبولة للفراغات";
      if (
        fillBlanks.some(
          (fb) =>
            !Number.isInteger(fb.index) ||
            fb.index < 0 ||
            fb.index >= fillBlanks.length,
        )
      )
        return "اختر رقماً صحيحاً لكل فراغ";
      if (new Set(fillBlanks.map((fb) => fb.index)).size !== fillBlanks.length)
        return "يجب أن يكون رقم كل فراغ مختلفاً";
      if (
        fillBlanks.some(
          (fb) =>
            fb.contentLength.trim() !== "" &&
            (!Number.isInteger(Number(fb.contentLength)) ||
              Number(fb.contentLength) < 1),
        )
      )
        return "عدد الأحرف يجب أن يكون رقماً صحيحاً أكبر من صفر";
      if (fillBlanks.some((fb) => /[,{}]/.test(richTextToPlainText(fb.hint))))
        return "تلميح الفراغ لا يمكن أن يحتوي على فاصلة أو أقواس معقوفة";
      return null;
    }

    if (type === "order") {
      if (orders.length < 2) return "يجب إضافة عنصرين للترتيب على الأقل";
      if (orders.some((o) => !hasRichTextContent(o.text)))
        return "أدخل نص جميع عناصر الترتيب";
      return null;
    }

    if (type === "classify") {
      if (classifyCategories.length < 2) return "أضف تصنيفين على الأقل";
      if (classifyItems.length < 2) return "أضف عنصرين للتصنيف على الأقل";
      if (classifyCategories.some((c) => !hasRichTextContent(c.text)))
        return "أدخل نص جميع التصنيفات";
      if (classifyItems.some((i) => !hasRichTextContent(i.text)))
        return "أدخل نص جميع العناصر";
      if (classifyItems.some((i) => i.categoryIndex === null))
        return "اختر تصنيفاً لكل عنصر";
      return null;
    }

    return null;
  }

  // --- دوال تجهيز الـ Payloads ---
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
      .map((fb) => ({
        index: fb.index,
        answers: fb.answers.map((answer) => answer.trim()).filter(Boolean),
      }))
      .sort((a, b) => a.index - b.index);
  }

  function buildOrderInputs() {
    return orders.map((o) => ({ text: o.text.trim() }));
  }

  function buildClassifyInputs() {
    const cats = classifyCategories.map((c) => ({
      text: c.text.trim(),
      type: "category" as const,
    }));
    const items = classifyItems.map((i) => ({
      text: i.text.trim(),
      type: "item" as const,
      correctCategoryIndex: i.categoryIndex as number,
    }));
    return [...cats, ...items];
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
    const tipsPayload = tips
      .filter(hasRichTextContent)
      .map((tip) => tip.trim());
    const titlePayload =
      type === "fillBlanks"
        ? serializeFillBlankTitle(title, fillBlanks)
        : title.trim();
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
          lessonId,
          purpose: "lesson",
          tips: tipsPayload,
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

  const selectClassName =
    "h-10 w-full rounded-lg border border-slate-200 bg-slate-100/50 px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-200";

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
          <div className="space-y-3">
            <Label htmlFor="question-title">نص السؤال</Label>
            <RichTextEditor
              id="question-title"
              ref={titleEditorRef}
              value={title}
              onChange={setTitle}
              placeholder={
                type === "fillBlanks"
                  ? `اكتب نص السؤال ثم أضف ${QUESTION_BLANK_MARKER} في موضع كل إجابة`
                  : "اكتب نص السؤال هنا..."
              }
              className="[&_.ql-editor]:min-h-32 [&_.ql-editor]:text-base [&_.ql-editor]:leading-7"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="question-image">صورة السؤال (اختياري)</Label>
            <input
              id="question-image"
              type="file"
              accept="image/*"
              ref={imageInputRef}
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
              className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
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
                      alt="معاينة"
                      className="max-h-40 rounded-lg border border-slate-200"
                    />
                  ) : (
                    <FileImage
                      fileId={editing!.imageId!}
                      alt="الصورة الحالية"
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
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    اسحب صورة هنا
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    أو انقر لاختيار صورة
                  </p>
                </>
              )}
            </div>
          </div>

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
                    className={`h-10 ${type === t ? "bg-blue-600 text-white" : ""}`}
                  >
                    {TYPE_META[t].label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
                                      Inputs for specific types
          ========================================================================= */}

          {!editing && type === "options" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="option-group-title">اسم مجموعة الخيارات</Label>
                <RichTextEditor
                  id="option-group-title"
                  value={optionGroupTitle}
                  onChange={setOptionGroupTitle}
                  placeholder="اسم مجموعة الخيارات"
                />
              </div>
              <Label>الخيارات (حدد الإجابة الصحيحة)</Label>
              {options.map((option, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    className="h-4 w-4 shrink-0 accent-blue-600"
                    checked={option.isCorrect}
                    onChange={() =>
                      setOptions((prev) =>
                        prev.map((o, j) => ({ ...o, isCorrect: j === i })),
                      )
                    }
                  />
                  <RichTextEditor
                    value={option.text}
                    placeholder={`الخيار ${i + 1}`}
                    className="flex-1"
                    onChange={(value) =>
                      setOptions((prev) =>
                        prev.map((o, j) =>
                          j === i ? { ...o, text: value } : o,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={options.length <= 2}
                    onClick={() =>
                      setOptions((prev) => prev.filter((_, j) => j !== i))
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
                  setOptions((prev) => [
                    ...prev,
                    { text: "", isCorrect: false },
                  ])
                }
              >
                <Plus className="h-4 w-4 ml-1" /> إضافة خيار
              </Button>
            </div>
          )}

          {!editing && type === "match" && (
            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-3">
                <Label>العناصر الأساسية</Label>
                {bases.map((base, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-lg bg-white border border-slate-200 p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <RichTextEditor
                        value={base.text}
                        placeholder={`العنصر ${i + 1}`}
                        className="flex-1"
                        onChange={(value) =>
                          setBases((prev) =>
                            prev.map((b, j) =>
                              j === i ? { ...b, text: value } : b,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={bases.length <= 1}
                        onClick={() =>
                          setBases((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <select
                      className={selectClassName}
                      value={base.matchIndex ?? ""}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? null : Number(e.target.value);
                        setBases((prev) =>
                          prev.map((b, j) =>
                            j === i ? { ...b, matchIndex: val } : b,
                          ),
                        );
                      }}
                    >
                      <option value="">اختر الإجابة</option>
                      {matches.map((m, j) => (
                        <option key={j} value={j}>
                          {richTextToPlainText(m.text) || `الإجابة ${j + 1}`}
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
                    setBases((prev) => [
                      ...prev,
                      { text: "", matchIndex: null },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 ml-1" /> عنصر جديد
                </Button>
              </div>

              <div className="space-y-3">
                <Label>الإجابات الممكنة</Label>
                {matches.map((match, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <RichTextEditor
                      value={match.text}
                      placeholder={`الإجابة ${i + 1}`}
                      className="flex-1"
                      onChange={(value) =>
                        setMatches((prev) =>
                          prev.map((m, j) => (j === i ? { text: value } : m)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={matches.length <= 1}
                      onClick={() =>
                        setMatches((prev) => prev.filter((_, j) => j !== i))
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
                  onClick={() => setMatches((prev) => [...prev, { text: "" }])}
                >
                  <Plus className="h-4 w-4 ml-1" /> إضافة إجابة
                </Button>
              </div>
            </div>
          )}

          {!editing && type === "trueFalse" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Label>الإجابة الصحيحة</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={trueFalseAnswer ? "default" : "outline"}
                  className="h-11 flex-1"
                  onClick={() => setTrueFalseAnswer(true)}
                >
                  صح
                </Button>
                <Button
                  type="button"
                  variant={!trueFalseAnswer ? "default" : "outline"}
                  className="h-11 flex-1"
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
                {fillBlanks.map((fb, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">
                        الفراغ {i + 1}
                      </p>
                      {!editing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFillBlank(i)}
                          aria-label={`حذف الفراغ ${i + 1}`}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`fill-blank-index-${i}`}>
                          رقم الإجابة
                        </Label>
                        <select
                          id={`fill-blank-index-${i}`}
                          className={selectClassName}
                          value={fb.index}
                          disabled={!!editing}
                          onChange={(e) =>
                            changeFillBlankIndex(i, Number(e.target.value))
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
                        <Label htmlFor={`fill-blank-direction-${i}`}>
                          اتجاه الكتابة
                        </Label>
                        <select
                          id={`fill-blank-direction-${i}`}
                          className={selectClassName}
                          value={fb.textDirection}
                          onChange={(e) =>
                            setFillBlanks((prev) =>
                              prev.map((row, position) =>
                                position === i
                                  ? {
                                      ...row,
                                      textDirection: e.target
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
                        <Label htmlFor={`fill-blank-length-${i}`}>
                          عدد الأحرف المسموح بها
                        </Label>
                        <Input
                          id={`fill-blank-length-${i}`}
                          type="number"
                          min={1}
                          step={1}
                          dir="ltr"
                          value={fb.contentLength}
                          placeholder="غير محدد"
                          onChange={(e) =>
                            setFillBlanks((prev) =>
                              prev.map((row, position) =>
                                position === i
                                  ? { ...row, contentLength: e.target.value }
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
                      <Label htmlFor={`fill-blank-hint-${i}`}>
                        تلميح الفراغ (اختياري)
                      </Label>
                      <RichTextEditor
                        id={`fill-blank-hint-${i}`}
                        direction={fb.textDirection}
                        value={fb.hint}
                        placeholder="مثال: اكتب اسم العاصمة"
                        onChange={(value) =>
                          setFillBlanks((prev) =>
                            prev.map((row, position) =>
                              position === i ? { ...row, hint: value } : row,
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
                      {fb.answers.map((answer, answerIndex) => (
                        <div
                          key={answerIndex}
                          className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              htmlFor={`fill-blank-${i}-answer-${answerIndex}`}
                              className="text-xs"
                            >
                              {answerIndex === 0
                                ? "الإجابة الأساسية"
                                : `الإجابة البديلة ${answerIndex}`}
                            </Label>
                            {!editing && fb.answers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-red-500"
                                aria-label={`حذف الإجابة ${answerIndex + 1}`}
                                onClick={() =>
                                  setFillBlanks((prev) =>
                                    prev.map((row, position) =>
                                      position === i
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
                          <RichTextEditor
                            id={`fill-blank-${i}-answer-${answerIndex}`}
                            direction={fb.textDirection}
                            value={answer}
                            readOnly={!!editing}
                            placeholder={
                              answerIndex === 0 ? "مثال: باريس" : "مثال: Paris"
                            }
                            onChange={(value) =>
                              setFillBlanks((prev) =>
                                prev.map((row, position) =>
                                  position === i
                                    ? {
                                        ...row,
                                        answers: row.answers.map(
                                          (currentAnswer, currentIndex) =>
                                            currentIndex === answerIndex
                                              ? value
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
                            setFillBlanks((prev) =>
                              prev.map((row, position) =>
                                position === i
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
              {orders.map((order, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <RichTextEditor
                    value={order.text}
                    placeholder={`العنصر رقم ${i + 1}`}
                    className="flex-1"
                    onChange={(value) =>
                      setOrders((prev) =>
                        prev.map((o, j) => (j === i ? { text: value } : o)),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={orders.length <= 2}
                    onClick={() =>
                      setOrders((prev) => prev.filter((_, j) => j !== i))
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
                onClick={() => setOrders((prev) => [...prev, { text: "" }])}
              >
                <Plus className="h-4 w-4 ml-1" /> إضافة عنصر ترتيب
              </Button>
            </div>
          )}

          {!editing && type === "classify" && (
            <div className="grid grid-cols-1  gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-3">
                <Label>التصنيفات (المجموعات)</Label>
                {classifyCategories.map((cat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <RichTextEditor
                      value={cat.text}
                      placeholder={`اسم التصنيف ${i + 1}`}
                      className="flex-1"
                      onChange={(value) =>
                        setClassifyCategories((prev) =>
                          prev.map((c, j) => (j === i ? { text: value } : c)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={classifyCategories.length <= 2}
                      onClick={() => {
                        setClassifyCategories((prev) =>
                          prev.filter((_, j) => j !== i),
                        );
                        setClassifyItems((prev) =>
                          prev.map((item) => ({
                            ...item,
                            categoryIndex:
                              item.categoryIndex === i
                                ? null
                                : item.categoryIndex !== null &&
                                    item.categoryIndex > i
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
                    setClassifyCategories((prev) => [...prev, { text: "" }])
                  }
                >
                  <Plus className="h-4 w-4 ml-1" /> تصنيف جديد
                </Button>
              </div>

              <div className="space-y-3">
                <Label>العناصر المراد تصنيفها</Label>
                {classifyItems.map((item, i) => (
                  <div
                    key={i}
                    className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <RichTextEditor
                        value={item.text}
                        placeholder={`العنصر ${i + 1}`}
                        className="flex-1"
                        onChange={(value) =>
                          setClassifyItems((prev) =>
                            prev.map((it, j) =>
                              j === i ? { ...it, text: value } : it,
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
                          setClassifyItems((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <select
                      className={selectClassName}
                      value={item.categoryIndex ?? ""}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? null : Number(e.target.value);
                        setClassifyItems((prev) =>
                          prev.map((it, j) =>
                            j === i ? { ...it, categoryIndex: val } : it,
                          ),
                        );
                      }}
                    >
                      <option value="">أين ينتمي هذا العنصر؟</option>
                      {classifyCategories.map((c, idx) => (
                        <option key={idx} value={idx}>
                          {richTextToPlainText(c.text) || `التصنيف ${idx + 1}`}
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
                    setClassifyItems((prev) => [
                      ...prev,
                      { text: "", categoryIndex: null },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 ml-1" /> عنصر جديد
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}

          <div className="space-y-3 pt-2">
            <Label>نصائح (اختياري)</Label>
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <RichTextEditor
                  value={tip}
                  placeholder={`نصيحة ${i + 1}`}
                  className="flex-1"
                  onChange={(value) =>
                    setTips((prev) => prev.map((t, j) => (j === i ? value : t)))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={tips.length <= 1}
                  onClick={() =>
                    setTips((prev) => prev.filter((_, j) => j !== i))
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
              onClick={() => setTips((prev) => [...prev, ""])}
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

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const canAddQuestions = !lesson?.used;
  const canDeleteQuestions = !lesson?.used;

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const questionsRes = await getLessonQuestions({ lessonId });
      const list = [...questionsRes.data.list].sort(
        (a, b) => a.index - b.index,
      );
      setQuestions(list);
      if (list.length > 0) {
        setLesson(list[0].lesson);
      } else {
        const lessonsRes = await getUnitLessons(unitId);
        setLesson(lessonsRes.data.find((l) => l.id === lessonId) ?? null);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Route parameter changes require synchronizing the list with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold">أسئلة الدرس</h1>
              {lesson &&
                (lesson.used ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    <Lock className="h-3 w-3" />
                    مستخدم
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                    غير مستخدم
                  </span>
                ))}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 wrap-break-word">
              {lesson
                ? `إدارة أسئلة درس "${lesson.title}"`
                : "إدارة أسئلة هذا الدرس"}
            </p>
          </div>
        </div>
        {canAddQuestions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ActionButton
              label="استيراد JSON"
              icon={Upload}
              bgClassName="bg-slate-700 hover:bg-slate-800 shadow-slate-200"
              className="flex-1 justify-center sm:flex-none"
              onClick={() => setBulkImportOpen(true)}
            />
            <ActionButton
              label="إضافة سؤال"
              icon={Plus}
              bgClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              className="flex-1 justify-center sm:flex-none"
              onClick={() => {
                setEditingQuestion(null);
                setFormOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {canDeleteQuestions && selectedIds.size > 0 && (
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

      {lesson?.used && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Lock className="h-4 w-4 shrink-0" />
          هذا الدرس مستخدم بالفعل — لا يمكن إضافة أو حذف الأسئلة لحفظ تقدم
          الطلاب.
        </div>
      )}

      {loading && <ListCardSkeleton />}

      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && questions.length === 0 && (
        <EmptyState
          icon={HelpCircle}
          title="لا توجد أسئلة لهذا الدرس بعد"
          description={
            canAddQuestions ? "ابدأ بإضافة السؤال الأول لهذا الدرس." : undefined
          }
          actionLabel={canAddQuestions ? "إضافة سؤال" : undefined}
          onAction={
            canAddQuestions
              ? () => {
                  setEditingQuestion(null);
                  setFormOpen(true);
                }
              : undefined
          }
        />
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="flex flex-col gap-4">
          {questions.map((question) => {
            const isExpanded = expandedId === question.id;
            const typeMeta = TYPE_META[question.type] ?? {
              label: question.type ?? "غير معروف",
              className: "bg-slate-100 text-slate-600 border-slate-200",
            };
            const matchItems =
              question.matchingItems?.filter((m) => m.type === "match") || [];
            const baseItems =
              question.matchingItems?.filter((m) => m.type === "base") || [];
            const orderItems = question.order ?? question.orderItems ?? [];
            const classifyItems = getQuestionClassifyItems(question);

            return (
              <Card
                key={question.id}
                onClick={() => setExpandedId(isExpanded ? null : question.id)}
                className="border-slate-200 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer p-4 md:p-6 flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-0">
                    {canDeleteQuestions && (
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
                      <h3
                        title={richTextToPlainText(
                          formatQuestionTitle(question.title),
                        )}
                        className="font-bold text-slate-900 truncate"
                      >
                        {richTextToPlainText(
                          formatQuestionTitle(question.title),
                        )}
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

                    {canDeleteQuestions && (
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
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : question.id)
                      }
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="border-t border-slate-100 pt-4 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RichTextContent
                      value={formatQuestionTitle(question.title)}
                      className="text-sm font-semibold leading-relaxed text-slate-700"
                    />

                    {question.imageId && (
                      <FileImage
                        fileId={question.imageId}
                        alt="Question image"
                        className="max-h-40 rounded-lg border border-slate-200"
                      />
                    )}

                    {/* Previews based on question type */}
                    {question.type === "options" && (
                      <div className="space-y-4">
                        {question.optionsGroups.map((group) => {
                          const options =
                            "options" in group ? group.options : [group];

                          return (
                            <div key={group.id} className="space-y-2">
                              {"options" in group && (
                                <RichTextContent
                                  value={group.text}
                                  className="text-sm font-semibold text-slate-700"
                                />
                              )}
                              <div className="space-y-2">
                                {options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${option.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                  >
                                    {option.isCorrect ? (
                                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    ) : (
                                      <Circle className="h-4 w-4 shrink-0" />
                                    )}
                                    <RichTextContent
                                      value={option.text}
                                      className="flex-1 text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
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
                                  <RichTextContent
                                    value={base.text}
                                    className="break-words"
                                  />
                                </div>
                                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400" />
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                                  <span className="mb-1 block text-[11px] font-semibold text-emerald-500">
                                    الإجابة الصحيحة
                                  </span>
                                  <RichTextContent
                                    value={paired?.text ?? "غير محددة"}
                                    className="break-words"
                                  />
                                </div>
                              </div>
                            );
                          })}
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
                        {question.fillBlanks?.map((fb) => (
                          <div
                            key={fb.id || fb.index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-bold text-slate-500">
                              فراغ {fb.index}:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {fb.answers.map((answer, answerIndex) => (
                                <div
                                  key={answerIndex}
                                  className="flex items-center gap-2"
                                >
                                  {answerIndex > 0 && (
                                    <span className="text-slate-400">أو</span>
                                  )}
                                  <RichTextContent
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
                          .map((item, i) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <RichTextContent
                                value={item.text}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700"
                              />
                              {i < orderItems.length - 1 && (
                                <ArrowLeft className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {question.type === "classify" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {classifyItems
                          .filter((c) => c.type === "category")
                          .sort((a, b) => a.index - b.index)
                          .map((cat) => (
                            <div
                              key={cat.id}
                              className="border border-slate-200 rounded-xl p-3 bg-slate-50/50"
                            >
                              <RichTextContent
                                value={cat.text}
                                className="mb-2 border-b border-slate-200 pb-2 font-bold text-slate-800"
                              />
                              <ul className="space-y-1.5">
                                {classifyItems
                                  .filter(
                                    (item) =>
                                      item.type === "item" &&
                                      item.correctCategoryIndex === cat.index,
                                  )
                                  .map((item) => (
                                    <li
                                      key={item.id}
                                      className="text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                                    >
                                      <RichTextContent value={item.text} />
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
                        {question.tips.map((tip, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
                          >
                            <Lightbulb className="h-4 w-4 shrink-0" />
                            <RichTextContent value={tip} className="flex-1" />
                          </div>
                        ))}
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

      {bulkImportOpen && (
        <BulkImportDialog
          lessonId={lessonId}
          onClose={() => setBulkImportOpen(false)}
          onSaved={() => {
            setBulkImportOpen(false);
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
            هل أنت متأكد من حذف سؤال &quot;
            {deleteTarget
              ? richTextToPlainText(formatQuestionTitle(deleteTarget.title))
              : ""}
            &quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
