import apiClient from "@/lib/axios";
import {
  ChallengeListResponse,
  DailyChallengeResponse,
} from "@/types/daily-challenge";

// ---- School
export async function getDailyChallenges(): Promise<DailyChallengeResponse> {
  const res = await apiClient.get<DailyChallengeResponse>(
    "curriculum/school/daily-challenge",
  );
  return res.data;
}

export async function createDailyChallenge(): Promise<ChallengeListResponse> {
  const res = await apiClient.post<ChallengeListResponse>(
    "curriculum/school/daily-challenge",
  );
  return res.data;
}
