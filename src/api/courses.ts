import apiClient from "@/lib/axios";
import { SubjectsResponse } from "@/types/courses";

export async function getSchoolCourses(
  trackId: string,
): Promise<SubjectsResponse> {
  const res = await apiClient.get<SubjectsResponse>(
    `/school/me/courses/${trackId}`,
  );
  return res.data;
}

export async function getAdminCourses(
  trackId: string,
): Promise<SubjectsResponse> {
  const res = await apiClient.get<SubjectsResponse>(
    "/learning/admin/courses",
    { params: { trackId } },
  );
  return res.data;
}
