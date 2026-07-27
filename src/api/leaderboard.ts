import apiClient from "@/lib/axios";
import { LeaderboardResponse } from "@/types/leaderboard";

export interface GetSchoolLeaderboardParams {
  skip?: number;
  limit?: number;
  sort?: "ASC" | "DESC";
}

export async function getSchoolLeaderboard(
  trackId: string,
  params: GetSchoolLeaderboardParams = {},
): Promise<LeaderboardResponse> {
  const res = await apiClient.get<LeaderboardResponse>(
    `/learning/solving/school/leaderboard/${trackId}`,
    { params },
  );
  return res.data;
}
