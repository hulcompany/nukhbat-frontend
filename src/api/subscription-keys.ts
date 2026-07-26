import apiClient from "@/lib/axios";
import {
  CreateSubscriptionKeysRequest,
  CreateSubscriptionKeysResponse,
  SubscriptionKeyListResponse,
  SchoolSubscriptionKeyListResponse,
  BulkDeleteSubscriptionKeysResponse,
} from "@/types/subscription-key";

export interface GetSubscriptionKeysParams {
  skip?: number;
  limit?: number;
}

export async function getSubscriptionKeys(
  params: GetSubscriptionKeysParams = {},
): Promise<SubscriptionKeyListResponse> {
  const res = await apiClient.get<SubscriptionKeyListResponse>(
    "/subscription/keys",
    { params },
  );
  return res.data;
}

// ---- For School ----

export async function getSchoolSubscriptionKeys(
  params: GetSubscriptionKeysParams = {},
): Promise<SchoolSubscriptionKeyListResponse> {
  const res = await apiClient.get<SchoolSubscriptionKeyListResponse>(
    "/subscription/keys/school",
    { params },
  );
  return res.data;
}

export async function createSubscriptionKeys(
  data: CreateSubscriptionKeysRequest,
): Promise<CreateSubscriptionKeysResponse> {
  const res = await apiClient.post<CreateSubscriptionKeysResponse>(
    "/subscription/keys",
    data,
  );
  return res.data;
}

export async function deleteSubscriptionKey(id: string): Promise<void> {
  await apiClient.delete(`/subscription/keys/${id}`);
}

export async function bulkDeleteSubscriptionKeys(
  ids: string[],
): Promise<BulkDeleteSubscriptionKeysResponse> {
  const res = await apiClient.post<BulkDeleteSubscriptionKeysResponse>(
    "/subscription/keys/bulk-delete",
    { ids },
  );
  return res.data;
}
