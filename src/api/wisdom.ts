import apiClient from "@/lib/axios";
import {
  WisdomListResponse,
  WisdomResponse,
  CreateWisdomRequest,
  UpdateWisdomRequest,
  BulkDeleteWisdomResponse,
} from "@/types/wisdom";

export interface GetWisdomParams {
  skip?: number;
  limit?: number;
}

export async function getWisdomList(
  params: GetWisdomParams = {},
): Promise<WisdomListResponse> {
  const res = await apiClient.get<WisdomListResponse>("/daily-wisement", {
    params,
  });
  return res.data;
}

export async function getTodayWisdom(): Promise<WisdomResponse> {
  const res = await apiClient.get<WisdomResponse>("/daily-wisement/today");
  return res.data;
}

export async function createWisdom(
  data: CreateWisdomRequest,
): Promise<WisdomResponse> {
  const res = await apiClient.post<WisdomResponse>("/daily-wisement", data);
  return res.data;
}

export async function updateWisdom(
  id: string,
  data: UpdateWisdomRequest,
): Promise<WisdomResponse> {
  const res = await apiClient.patch<WisdomResponse>(
    `/daily-wisement/${id}`,
    data,
  );
  return res.data;
}

export async function deleteWisdom(id: string): Promise<void> {
  await apiClient.delete(`/daily-wisement/${id}`);
}

export async function bulkDeleteWisdom(
  ids: string[],
): Promise<BulkDeleteWisdomResponse> {
  const res = await apiClient.post<BulkDeleteWisdomResponse>(
    "/daily-wisement/bulk-delete",
    { ids },
  );
  return res.data;
}
