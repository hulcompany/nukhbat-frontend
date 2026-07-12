import apiClient from "@/lib/axios";
import {
  StudentsListResponse,
  StudentResponse,
  StudentActivationResponse,
} from "@/types/student";

// --------- For Admin ---------

export interface GetStudentsParams {
  skip?: number;
  limit?: number;
  trackId?: string;
  schoolId?: string;
  name?: string;
  sort?: "ASC" | "DESC";
}

export async function getStudents(
  params: GetStudentsParams = {},
): Promise<StudentsListResponse> {
  const res = await apiClient.get<StudentsListResponse>("/student", {
    params,
  });
  return res.data;
}

export async function getStudentById(id: string): Promise<StudentResponse> {
  const res = await apiClient.get<StudentResponse>(`/student/${id}`);
  return res.data;
}

// --------- For School ---------

export interface GetSchoolStudentsParams {
  skip?: number;
  limit?: number;
  trackId?: string;
  name?: string;
  sort?: "ASC" | "DESC";
}

export async function getSchoolStudents(
  params: GetSchoolStudentsParams = {},
): Promise<StudentsListResponse> {
  const res = await apiClient.get<StudentsListResponse>("/student/school", {
    params,
  });
  return res.data;
}

export async function getSchoolStudentById(
  id: string,
): Promise<StudentResponse> {
  const res = await apiClient.get<StudentResponse>(`/student/school/${id}`);
  return res.data;
}

export async function setStudentActivation(
  id: string,
  active: boolean,
): Promise<StudentActivationResponse> {
  const res = await apiClient.patch<StudentActivationResponse>(
    `/student/school/activation/${id}`,
    { active },
  );
  return res.data;
}
