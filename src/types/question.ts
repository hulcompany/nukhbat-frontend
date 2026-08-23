import { Lesson } from "./lesson";

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
  correctMatchId: string | null;
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
  course?: any; // --------------
  courseId: string | null;
  optionsGroups: QuestionOption[];
  trueOrFalseAnswer: boolean | null;
  classifyItems: ClassifyItem[];
  matchingItems: QuestionMatchItem[];
  orderItems: QuestionOrderItem[];
  fillBlanks: QuestionFillBlank[];
  imageId: string | null;
  school?: QuestionSchool;
  schoolId: string;
  tips: string[];
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

export interface BulkOptionsQuestionInput {
  title: string;
  type: "options";
  lessonId: string;
  options: QuestionOptionInput[];
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

// 6. إضافة الواجهات الجديدة للـ Union Type الشامل
export type BulkQuestionInput =
  | BulkOptionsQuestionInput
  | BulkMatchQuestionInput
  | BulkTrueFalseQuestionInput
  | BulkFillBlanksQuestionInput
  | BulkOrderQuestionInput;

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
