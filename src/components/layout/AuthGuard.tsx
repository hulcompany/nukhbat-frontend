"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo: string;
  allowedRoles: UserRole[];
}

const roleDashboard: Partial<Record<UserRole, string>> = {
  admin: "/dashboard-8ukhba2",
  contentWriter: "/dashboard",
};

export function AuthGuard({ children, redirectTo, allowedRoles }: AuthGuardProps) {
  const { accessToken, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!accessToken || !user) {
      router.replace(redirectTo);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const destination = roleDashboard[user.role] ?? redirectTo;
      router.replace(destination);
    }
  }, [isLoading, accessToken, user, redirectTo, allowedRoles, router]);

  if (isLoading) return null;
  if (!accessToken || !user) return null;
  if (!allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
