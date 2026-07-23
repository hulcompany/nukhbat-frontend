import apiClient from "@/lib/axios";
import { SubjectsResponse } from "@/types/courses";

// ---- School
export async function getSchoolCourses(
  trackId: string,
): Promise<SubjectsResponse> {
  const res = await apiClient.get<SubjectsResponse>(
    `/curriculum/school/courses/${trackId}`,
  );
  return res.data;
}

// ---- Admin
export async function getAdminCourses(
  trackId: string,
): Promise<SubjectsResponse> {
  const res = await apiClient.get<SubjectsResponse>(
    "/curriculum/admin/courses",
    {
      params: { trackId },
    },
  );
  return res.data;
}
