import apiClient from "@/lib/axios";
import { UnitResponse, UnitsResponse } from "@/types/unit";

export async function getCourseUnits(
  courseId: string,
  title?: string
): Promise<UnitsResponse> {
  const res = await apiClient.get<UnitsResponse>(
    `/learning/school/units/${courseId}`,
    { params: title ? { title } : undefined }
  );
  return res.data;
}

export async function createUnit(data: {
  title: string;
  courseId: string;
}): Promise<UnitResponse> {
  const res = await apiClient.post<UnitResponse>(
    "/learning/school/units",
    data
  );
  return res.data;
}

export async function updateUnit(
  id: string,
  data: { title?: string }
): Promise<void> {
  await apiClient.patch(`/learning/school/units/${id}`, data);
}

export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/learning/school/units/${id}`);
}

export async function reorderUnits(
  courseId: string,
  ids: string[]
): Promise<void> {
  await apiClient.post(`/learning/school/units/order/${courseId}`, { ids });
}
