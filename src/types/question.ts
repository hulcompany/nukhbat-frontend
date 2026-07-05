export type QuestionType = "options" | "match";
export type QuestionMatchType = "base" | "match";
export type QuestionPurpose = "lesson" | "dailyChallenge";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
  imageId: string | null;
}

export interface QuestionMatchItem {
  id: string;
  text: string;
  type: QuestionMatchType;
  correctMatchId: string | null;
  questionId: string;
  schoolId: string;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  index: number;
  purpose: QuestionPurpose;
  lessonId: string | null;
  courseId: string;
  imageId: string | null;
  schoolId: string;
  options: QuestionOption[];
  matchingItems: QuestionMatchItem[];
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

export interface QuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface QuestionMatchItemInput {
  text: string;
  type: QuestionMatchType;
  correctIndex?: number;
}
