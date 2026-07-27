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
