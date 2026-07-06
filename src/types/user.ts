import { UserRole } from "./auth";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  emailVerfied: boolean;
  role: UserRole;
  profileImage: string | null;
  createdAt: string; // ISO Date string
  isCompleted: boolean;
}

export interface UserResponse {
  message: string;
  data: UserListItem;
}

export interface UserListResponse {
  message: string;
  data: {
    list: UserListItem[];
    next: boolean;
    back: boolean;
    totalRecords: number;
  };
}
