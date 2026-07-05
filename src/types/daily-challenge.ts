import { Track } from "./track";

export interface Question {
  id: string;
  title: string;
  type: "match" | "options" | string;
  index: number;
  purpose: string;
  lessonId: string | null;
  courseId: string;
  imageId: string | null;
  schoolId: string;
}

export interface UsedQuestionItem {
  id: string;
  question: Question;
}

export interface Challenge {
  id: string;
  date: string; // YYYY-MM-DD
  track: Track;
  usedQuestions: UsedQuestionItem[];
}

export interface UnusedQuestionSummary {
  courseId: string;
  courseName: string;
  trackId: string;
  trackName: string;
  remainingQuestions: number;
}

export interface DailyChallengeData {
  challenges: Challenge[];
  unUsedQuestions: UnusedQuestionSummary[];
}

export interface DailyChallengeResponse {
  message: string;
  data: DailyChallengeData;
}

// The new wrapper where 'data' is directly an array of Challenge objects
export interface ChallengeListResponse {
  message: string;
  data: Challenge[];
}
