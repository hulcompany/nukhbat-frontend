import apiClient from "@/lib/axios";
import { UnitResponse, UnitsResponse } from "@/types/unit";

export async function getCourseUnits(
  courseId: string,
  title?: string,
): Promise<UnitsResponse> {
  const res = await apiClient.get<UnitsResponse>(
    `/school/me/units/${courseId}`,
    { params: title ? { title } : undefined },
  );
  return res.data;
}

export async function createUnit(data: {
  title: string;
  courseId: string;
}): Promise<UnitResponse> {
  const res = await apiClient.post<UnitResponse>("/school/me/units", data);
  return res.data;
}

export async function updateUnit(
  id: string,
  data: { title?: string },
): Promise<void> {
  await apiClient.patch(`/school/me/units/${id}`, data);
}

export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/school/me/units/${id}`);
}

export async function reorderUnits(
  courseId: string,
  ids: string[],
): Promise<void> {
  await apiClient.post(`/school/me/units/order/${courseId}`, { ids });
}
