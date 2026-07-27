import { Track } from "./track";
import { UserRole } from "./auth";

export interface LeaderboardOwner {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
}

export interface LeaderboardSchool {
  id: string;
  name: string;
  logo: string | null;
  owner: LeaderboardOwner;
  default: boolean;
}

export interface LeaderboardStudentUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
}

export interface LeaderboardStudent {
  id: string;
  userId: string;
  user: LeaderboardStudentUser;
  active: boolean;
  schoolId: string;
  school: LeaderboardSchool;
  trackId: string;
  track: Track;
  xp: number;
  gems: number;
  createdAt: string; // ISO Date string
}

export interface LeaderboardEntry {
  studentId: string;
  xp: number;
  student: LeaderboardStudent;
}

export interface LeaderboardListData {
  list: LeaderboardEntry[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface LeaderboardResponse {
  message: string;
  data: LeaderboardListData;
}
