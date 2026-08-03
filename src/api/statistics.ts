import apiClient from "@/lib/axios";
import {
  AggregateActivityResponse,
  SchoolStatisticsResponse,
  SubscriptionAggregateResponse,
} from "@/types/statistics";

// ---- Admin ----
export async function getAdminAggregateSubscriptions(): Promise<SubscriptionAggregateResponse> {
  const res = await apiClient.get<SubscriptionAggregateResponse>(
    "/subscription/admin/aggregate/subscriptions",
  );
  return res.data;
}
export async function getAdminAggregateActivity(): Promise<AggregateActivityResponse> {
  const res = await apiClient.get<AggregateActivityResponse>(
    "/student/admin/aggregate/activity",
  );
  return res.data;
}

// --- School ---

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

export async function getSchoolAggregateActivity(): Promise<AggregateActivityResponse> {
  const res = await apiClient.get<AggregateActivityResponse>(
    "/student/school/aggregate/activity",
  );
  return res.data;
}
