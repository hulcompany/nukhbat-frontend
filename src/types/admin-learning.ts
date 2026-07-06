import { Track } from "./track";
import { School } from "./school";
import { LessonStatus } from "./lesson";

export interface AdminCourse {
  id: string;
  title: string;
  trackId: string;
  track: Track;
  createdAt: string; // ISO Date string
}

export interface AdminCoursesResponse {
  message: string;
  data: AdminCourse[];
}

export interface AdminUnit {
  id: string;
  title: string;
  courseId: string;
  schoolId: string;
  school: School;
  index: number;
}

export interface AdminUnitsResponse {
  message: string;
  data: AdminUnit[];
}

export interface AdminLesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  index: number;
  schoolId: string;
  school: School;
  status: LessonStatus;
  questionCount: number;
}

export interface AdminLessonsResponse {
  message: string;
  data: AdminLesson[];
}
