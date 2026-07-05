export type LessonStatus = "active" | "draft" | "unActive";

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  unitId: string;
  schoolId: string;
  index: number;
  status: LessonStatus;
  questionCount: number | null;
}

export interface LessonsResponse {
  message: string;
  data: Lesson[];
}

export interface LessonResponse {
  message: string;
  data: Lesson;
}
