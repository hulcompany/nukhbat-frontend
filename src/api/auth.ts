import apiClient from "@/lib/axios";
import {
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshToekRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function forgetPassword(
  data: ForgetPasswordRequest,
): Promise<ForgetPasswordResponse> {
  const res = await apiClient.post<ForgetPasswordResponse>(
    "/user/mine/forget-password",
    data,
  );
  return res.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const res = await apiClient.post<ResetPasswordResponse>(
    "/user/mine/reset-password",
    data,
  );
  return res.data;
}

export async function refreshAccessToken(
  data: RefreshToekRequest
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/refresh", data);
  return res.data;
}
