import apiClient from "@/lib/axios";
import { TracksResponse } from "@/types/track";

export async function getTracks(): Promise<TracksResponse> {
  const res = await apiClient.get<TracksResponse>("/curriculum/tracks");
  return res.data;
}

export async function grantTrackAccess(
  schoolId: string,
  trackId: string,
): Promise<void> {
  await apiClient.post(`/learning/admin/schoolAccess/${schoolId}/${trackId}`);
}

export async function revokeTrackAccess(
  schoolId: string,
  trackId: string,
): Promise<void> {
  await apiClient.delete(`/learning/admin/schoolAccess/${schoolId}/${trackId}`);
}
