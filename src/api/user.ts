import apiClient from "@/lib/axios";
import { UserRole } from "@/types/auth";
import { UserListResponse, UserResponse } from "@/types/user";

export interface GetUsersParams {
  skip?: number;
  limit?: number;
  sort?: "ASC" | "DESC";
  name?: string;
  role?: UserRole;
  email?: string;
}

export async function getUsers(
  params: GetUsersParams = {},
): Promise<UserListResponse> {
  const res = await apiClient.get<UserListResponse>("/user", { params });
  return res.data;
}

export interface UpdateMyUserData {
  name?: string;
  image?: File;
  password?: string;
}

export async function updateMyUser(
  data: UpdateMyUserData,
): Promise<UserResponse> {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.image) formData.append("image", data.image);
  if (data.password !== undefined) formData.append("password", data.password);

  const res = await apiClient.patch<UserResponse>("/user/mine", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
