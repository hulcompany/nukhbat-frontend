import apiClient from "@/lib/axios";
import { LoginRequest, LoginResponse, RefreshToekRequest } from "@/types/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function refreshAccessToken(
  data: RefreshToekRequest
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/refresh", data);
  return res.data;
}
