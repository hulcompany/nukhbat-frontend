import { Track } from "./track";
import { UserRole } from "./auth";

export interface AttemptStudentUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
}

export interface AttemptStudent {
  id: string;
  userId: string;
  user: AttemptStudentUser;
  active: boolean;
  schoolId: string;
  trackId: string;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  xp: number;
  gems: number;
  createdAt: string; // ISO Date string
}

export interface AttemptCourse {
  id: string;
  title: string;
  trackId: string;
  createdAt: string; // ISO Date string
}

export interface QuestionVerdictDetail {
  skipped: boolean;
  verdict: boolean;
  verdicts?: any[];
  answered?: any;
  correctAnswer?: any;
}

export interface QuestionVerdictItem {
  id: string;
  type: string; // "options" | "match" | "fillBlanks" | "trueFalse" | "order" | "classify"
  title: string;
  result: QuestionVerdictDetail;
  verdict: boolean;
  isSkipped: boolean;
}

export interface AttemptResult {
  score: number;
  total: number;
  passed: boolean;
  correct: number;
  skipped: number;
  verdicts: QuestionVerdictItem[];
}

export interface Attempt {
  id: string;
  student: AttemptStudent;
  studentId: string;
  lessonId: string;
  schoolId: string;
  track: Track;
  trackId: string;
  course: AttemptCourse;
  courseId: string;
  unitId: string;
  lessonTitle: string;
  attemptNumber: number;
  questionsTotal: number;
  questionsCorrect: number;
  questionsSkipped: number;
  completed: boolean;
  xpAwarded: number;
  result: AttemptResult;
  createdAt: string; // ISO Date string
}

export interface AttemptsListData {
  list: Attempt[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface AttemptsListResponse {
  message: string;
  data: AttemptsListData;
}
