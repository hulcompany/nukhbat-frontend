// --- Request Interface ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshToekRequest {
  token: string;
}

// --- Response Interfaces ---

// Defining specific roles
export type UserRole = "admin" | "contentWriter" | "student" | string;

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerfied: boolean;
  role: UserRole;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  isCompleted: boolean;
}

export interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}
