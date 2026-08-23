import apiClient from "@/lib/axios";
import { AttemptsListResponse } from "@/types/attempt";

export interface GetSchoolAttemptsParams {
  skip?: number;
  limit?: number;
  sort?: "ASC" | "DESC";
  completed?: boolean;
  lessonId?: string;
}

export async function getSchoolAttempts(
  params: GetSchoolAttemptsParams = {},
): Promise<AttemptsListResponse> {
  const res = await apiClient.get<AttemptsListResponse>(
    "/learning/attempts/school",
    { params },
  );
  return res.data;
}
