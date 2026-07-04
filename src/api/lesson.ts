import apiClient from "@/lib/axios";
import { LessonResponse, LessonsResponse, LessonStatus } from "@/types/lesson";

export async function getUnitLessons(unitId: string): Promise<LessonsResponse> {
  const res = await apiClient.get<LessonsResponse>(
    `/learning/school/lessons/${unitId}`
  );
  return res.data;
}

export async function createLesson(data: {
  title: string;
  description?: string;
  unitId: string;
}): Promise<LessonResponse> {
  const res = await apiClient.post<LessonResponse>(
    "/learning/school/lessons",
    data
  );
  return res.data;
}

export async function updateLesson(
  id: string,
  data: { title?: string; description?: string; status?: LessonStatus }
): Promise<void> {
  await apiClient.patch(`/learning/school/lessons/${id}`, data);
}

export async function deleteLesson(id: string): Promise<void> {
  await apiClient.delete(`/learning/school/lessons/${id}`);
}

export async function reorderLessons(
  unitId: string,
  ids: string[]
): Promise<void> {
  await apiClient.post(`/learning/school/lessons/order/${unitId}`, { ids });
}
