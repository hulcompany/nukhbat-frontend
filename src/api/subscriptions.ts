import apiClient from "@/lib/axios";
import { SubscriptionListResponse } from "@/types/subscription";

export interface GetSubscriptionsParams {
  skip?: number;
  limit?: number;
}

export async function getSubscriptions(
  params: GetSubscriptionsParams = {},
): Promise<SubscriptionListResponse> {
  const res = await apiClient.get<SubscriptionListResponse>("/subscription", {
    params,
  });
  return res.data;
}
