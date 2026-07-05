import apiClient from "@/lib/axios";
import { ChallengeListResponse, DailyChallengeResponse } from "@/types/daily-challenge";

export async function getDailyChallenges(): Promise<DailyChallengeResponse> {
  const res = await apiClient.get<DailyChallengeResponse>(
    "/learning/school/daily-challenge"
  );
  return res.data;
}

export async function createDailyChallenge(): Promise<ChallengeListResponse> {
  const res = await apiClient.post<ChallengeListResponse>(
    "/learning/school/daily-challenge"
  );
  return res.data;
}
