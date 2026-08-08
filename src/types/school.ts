import { UserRole } from "./auth";
import { Track } from "./track";

export interface CreateSchoolRequest {
  schoolName: string;
  name: string;
  email: string;
  password: string;
  image: File;
  phoneNumber: string;
}

export interface SchoolOwner {
  id: string;
  name: string;
  email: string;
  emailVerfied: boolean;
  phoneNumber: string;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  isCompleted: boolean;
}

export interface SchoolManagementData {
  id: string;
  name: string;
  logo: string;
  owner: SchoolOwner;
}

export interface SchoolManagementResponse {
  message: string;
  data: SchoolManagementData;
}

// You might already have this from the previous setup

export interface SchoolOwner {
  id: string;
  name: string;
  email: string;
  emailVerfied: boolean;
  phoneNumber: string;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  isCompleted: boolean;
}

export interface School {
  id: string;
  name: string;
  logo: string | null;
  phoneNumber: string;
  owner: SchoolOwner;
  default?: boolean;
  tracks?: Track[];
  allowedTracks?: Track[];
}

export interface SchoolListResponse {
  message: string;
  data: {
    list: School[];
    totalRecords: number;
  };
}
export interface SchoolResponse {
  message: string;
  data: School;
}
