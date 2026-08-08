import apiClient from "@/lib/axios";
import {
  CreateSchoolRequest,
  SchoolListResponse,
  SchoolManagementResponse,
  SchoolResponse,
} from "@/types/school";

export interface GetSchoolsParams {
  skip?: number;
  limit?: number;
  name?: string;
}

// -------- Admin --------
export async function getSchools(
  params: GetSchoolsParams = {},
): Promise<SchoolListResponse> {
  const res = await apiClient.get<SchoolListResponse>("/school/manage", {
    params,
  });
  return res.data;
}

export async function getSchoolById(id: string): Promise<SchoolResponse> {
  const res = await apiClient.get<SchoolResponse>(`/school/manage/${id}`);
  console.log(res.data);
  return res.data;
}

export async function deleteSchoolImage(id: string): Promise<void> {
  await apiClient.delete(`/school/${id}/deleteImage`);
}

export async function updateSchool(
  id: string,
  data: { name: string; image: File },
): Promise<SchoolManagementResponse> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("image", data.image);

  const res = await apiClient.patch<SchoolManagementResponse>(
    `/school/manage/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function createSchool(
  data: CreateSchoolRequest,
): Promise<SchoolManagementResponse> {
  const formData = new FormData();
  formData.append("schoolName", data.schoolName);
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("image", data.image);
  formData.append("phoneNumber", data.phoneNumber); // <-- Added phone number payload

  const res = await apiClient.post<SchoolManagementResponse>(
    "/school/manage",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

// -------- School --------
export async function getMySchool(): Promise<SchoolResponse> {
  const res = await apiClient.get<SchoolResponse>("/school/me");
  return res.data;
}

export async function updateMySchool(data: {
  name?: string;
  image?: File;
  password?: string;
  phoneNumber?: string;
}): Promise<SchoolResponse> {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.image) formData.append("image", data.image);
  if (data.password !== undefined) formData.append("password", data.password);
  if (data.phoneNumber !== undefined)
    formData.append("phoneNumber", data.phoneNumber);

  const res = await apiClient.patch<SchoolResponse>("/school/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteMySchoolImage(): Promise<void> {
  await apiClient.delete("/user/mine/image");
}
