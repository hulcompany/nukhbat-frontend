import apiClient from "@/lib/axios";
import { LessonResponse, LessonsResponse, LessonStatus } from "@/types/lesson";

// ---- School
export async function getUnitLessons(unitId: string): Promise<LessonsResponse> {
  console.log(unitId);
  const res = await apiClient.get<LessonsResponse>(
    `/curriculum/school/lessons/${unitId}`,
  );

  console.log(res.data);
  return res.data;
}

export async function createLesson(data: {
  title: string;
  description?: string;
  unitId: string;
}): Promise<LessonResponse> {
  const res = await apiClient.post<LessonResponse>(
    "/curriculum/school/lessons",
    data,
  );
  return res.data;
}

export async function updateLesson(
  id: string,
  data: { title?: string; description?: string; status?: LessonStatus },
): Promise<void> {
  await apiClient.patch(`/curriculum/school/lessons/${id}`, data);
}

export async function deleteLesson(id: string): Promise<void> {
  await apiClient.delete(`/curriculum/school/lessons/${id}`);
}

export async function reorderLessons(
  unitId: string,
  ids: string[],
): Promise<void> {
  await apiClient.post(`/curriculum/school/lessons/order/${unitId}`, { ids });
}
