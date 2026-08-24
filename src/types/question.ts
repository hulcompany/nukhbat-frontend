import { Lesson } from "./lesson";
import { Subject } from "./courses";

export type QuestionType =
  | "options"
  | "match"
  | "trueFalse"
  | "fillBlanks"
  | "order"
  | "classify";
export type QuestionMatchType = "base" | "match";
export type QuestionPurpose = "lesson" | "dailyChallenge";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
  imageId: string | null;
}

export interface QuestionOptionGroup {
  id: string;
  title: string;
  index: number;
  options: QuestionOption[];
}

export interface ClassifyItem {
  id: string;
  text: string;
  type: "category" | "item";
  index: number;
  correctCategoryIndex: number | null;
  questionId: string;
  schoolId: string;
}

export interface QuestionMatchItem {
  id: string;
  text: string;
  type: QuestionMatchType;
  index?: number;
  correctIndex?: number | null;
  /** @deprecated Older API response relation. */
  correctMatchId?: string | null;
  questionId: string;
  schoolId: string;
}

export interface QuestionOrderItem {
  id?: string;
  text: string;
  sort?: number;
  questionId?: string;
}

export interface QuestionFillBlank {
  id?: string;
  index: number;
  answers: string[];
  questionId?: string;
  schoolId?: string;
}

export interface QuestionSchool {
  id: string;
  name: string;
  logo: string | null;
  default: boolean;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  index: number;
  purpose: QuestionPurpose;
  lesson: Lesson;
  lessonId: string | null;
  course?: Subject | null;
  courseId: string | null;
  optionsGroups: Array<QuestionOptionGroup | QuestionOption>;
  trueOrFalse?: boolean | null;
  trueOrFalseAnswer?: boolean | null;
  /** @deprecated Older API response name. */
  classify?: ClassifyItem[];
  classifyItems: ClassifyItem[];
  matchingItems: QuestionMatchItem[];
  order?: QuestionOrderItem[];
  orderItems?: QuestionOrderItem[];
  fillBlanks: QuestionFillBlank[];
  imageId: string | null;
  school?: QuestionSchool;
  schoolId: string;
  tips: string[];
}

export function getQuestionOptions(
  question: Pick<Question, "optionsGroups">,
): QuestionOption[] {
  return question.optionsGroups.flatMap((group) =>
    "options" in group ? group.options : [group],
  );
}

export function getQuestionTrueFalseAnswer(
  question: Pick<Question, "trueOrFalse" | "trueOrFalseAnswer">,
): boolean | null {
  return question.trueOrFalse ?? question.trueOrFalseAnswer ?? null;
}

export function getQuestionCorrectMatch(
  baseItem: QuestionMatchItem,
  matchingItems: QuestionMatchItem[],
): QuestionMatchItem | undefined {
  return matchingItems.find(
    (item) =>
      item.type === "match" &&
      ((baseItem.correctIndex != null &&
        item.index === baseItem.correctIndex) ||
        (!!baseItem.correctMatchId && item.id === baseItem.correctMatchId)),
  );
}

export function getQuestionClassifyItems(
  question: Pick<Question, "classify" | "classifyItems">,
): ClassifyItem[] {
  if (question.classifyItems?.length) return question.classifyItems;
  return question.classify ?? [];
}

export const QUESTION_BLANK_MARKER = "__________";

export function formatQuestionTitle(title: string): string {
  return title.replace(
    /\*?\{\{textField:\s*\{[^{}]*\}\}\}\*?/g,
    QUESTION_BLANK_MARKER,
  );
}

export interface QuestionsListData {
  list: Question[];
  totalRecords: number;
}

export interface QuestionsResponse {
  message: string;
  data: QuestionsListData;
}

export interface QuestionResponse {
  message: string;
  data: Question;
}

// --- واجهات الإدخال (Inputs) ---

export interface QuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface QuestionOptionGroupInput {
  title: string;
  index: number;
  options: QuestionOptionInput[];
}

export interface QuestionMatchItemInput {
  text: string;
  type: QuestionMatchType;
  correctIndex?: number;
}

export interface QuestionFillBlankInput {
  index: number;
  answers: string[];
}

export interface QuestionOrderItemInput {
  text: string;
}

export interface ClassifyItemInput {
  text: string;
  type: "category" | "item";
  correctCategoryIndex?: number;
}

export interface BulkOptionsQuestionInput {
  title: string;
  type: "options";
  lessonId: string;
  optionGroups: QuestionOptionGroupInput[];
}

export interface BulkMatchQuestionInput {
  title: string;
  type: "match";
  lessonId: string;
  matchingItems: QuestionMatchItemInput[];
}

export interface BulkTrueFalseQuestionInput {
  title: string;
  type: "trueFalse";
  lessonId: string;
  correctAnswer: boolean;
}

export interface BulkFillBlanksQuestionInput {
  title: string;
  type: "fillBlanks";
  purpose?: string;
  lessonId: string;
  fillBlanks: QuestionFillBlankInput[];
}

export interface BulkOrderQuestionInput {
  title: string;
  type: "order";
  purpose?: string;
  lessonId: string;
  orders: QuestionOrderItemInput[];
}

export interface BulkClassifyQuestionInput {
  title: string;
  type: "classify";
  purpose?: string;
  lessonId: string;
  classify: ClassifyItemInput[];
}

export type BulkQuestionInput =
  | BulkOptionsQuestionInput
  | BulkMatchQuestionInput
  | BulkTrueFalseQuestionInput
  | BulkFillBlanksQuestionInput
  | BulkOrderQuestionInput
  | BulkClassifyQuestionInput;

export interface BulkCreateQuestionsRequest {
  questions: BulkQuestionInput[];
}

export interface BulkCreateQuestionsResponse {
  message: string;
  data: Question[];
}

export interface BulkDeleteQuestionsRequest {
  ids: string[];
}

export interface BulkDeleteQuestionsResponse {
  message: string;
}
