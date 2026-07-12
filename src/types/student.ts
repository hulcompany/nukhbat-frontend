import { UserRole } from "./auth";
import { Track } from "./track";

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  emailVerfied: boolean;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
  isCompleted: boolean;
}

export interface StudentSchool {
  id: string;
  name: string;
  logo: string | null;
  owner?: StudentUser;
  default: boolean;
}

export interface SchoolStudent {
  id: string;
  userId: string;
  user: StudentUser;
  active: boolean;
  schoolId: string;
  school: StudentSchool;
  trackId: string;
  track: Track;
  createdAt: string; // ISO Date string
}

export interface StudentsListData {
  list: SchoolStudent[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface StudentsListResponse {
  message: string;
  data: StudentsListData;
}

export interface StudentResponse {
  message: string;
  data: SchoolStudent;
}

export interface StudentActivationResponse {
  message: string;
  data: Omit<SchoolStudent, "user">;
}
