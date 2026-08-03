import apiClient from "@/lib/axios";
import {
  SchoolStatisticsResponse,
  SubscriptionAggregateResponse,
} from "@/types/statistics";

export async function getSchoolAggregateSubscriptions(): Promise<SubscriptionAggregateResponse> {
  const res = await apiClient.get<SubscriptionAggregateResponse>(
    "/subscription/school/aggregate/subscriptions",
  );
  return res.data;
}

export async function getSchoolStatistics(): Promise<SchoolStatisticsResponse> {
  const res = await apiClient.get<SchoolStatisticsResponse>(
    "/school/me/statistics",
  );
  return res.data;
}
