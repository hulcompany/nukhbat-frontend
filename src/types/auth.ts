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

export interface ForgetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
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
  profileImage?: string | null;
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

export interface ForgetPasswordResponse {
  message: string;
  data: {
    nextAttempt: string; // ISO Date string
    sent: boolean;
  };
}

export interface ResetPasswordResponse {
  message: string;
}
