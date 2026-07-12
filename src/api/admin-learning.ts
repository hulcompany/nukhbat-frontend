import apiClient from "@/lib/axios";
import {
  AdminCoursesResponse,
  AdminLessonsResponse,
  AdminUnitsResponse,
} from "@/types/admin-learning";
import { QuestionsResponse } from "@/types/question";

export async function getAdminCourses(params: {
  trackId?: string;
}): Promise<AdminCoursesResponse> {
  const res = await apiClient.get<AdminCoursesResponse>(
    "/learning/admin/courses",
    { params },
  );
  return res.data;
}

export async function getAdminUnits(params: {
  schoolId?: string;
  courseId?: string;
  title?: string;
}): Promise<AdminUnitsResponse> {
  const res = await apiClient.get<AdminUnitsResponse>("/learning/admin/units", {
    params,
  });
  return res.data;
}

export async function getAdminLessons(params: {
  unitId?: string;
  courseId?: string;
  schoolId?: string;
  title?: string;
}): Promise<AdminLessonsResponse> {
  const res = await apiClient.get<AdminLessonsResponse>(
    "/learning/admin/lessons",
    { params },
  );
  return res.data;
}

export async function getAdminQuestions(params: {
  skip?: number;
  limit?: number;
  courseId?: string;
  lessonId?: string;
  schoolId?: string;
  title?: string;
  trackId?: string;
}): Promise<QuestionsResponse> {
  const res = await apiClient.get<QuestionsResponse>(
    "/learning/admin/questions",
    { params },
  );
  return res.data;
}
