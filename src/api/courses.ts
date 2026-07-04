import apiClient from "@/lib/axios";
import { SubjectsResponse } from "@/types/courses";

export async function getSchoolCourses(
  trackId: string
): Promise<SubjectsResponse> {
  const res = await apiClient.get<SubjectsResponse>(
    `/learning/school/courses/${trackId}`
  );
  return res.data;
}
