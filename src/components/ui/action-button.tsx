"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: LucideIcon;
  /**
   * Optional custom background color classes.
   * Example: "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
   */
  bgClassName?: string;
}

export function ActionButton({
  label,
  icon: Icon,
  className,
  bgClassName,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        "text-white rounded-lg px-6 h-11 transition-all shadow-sm",
        bgClassName,
        className
      )}
      {...props}
    >
      {label}
      {Icon && <Icon className="mr-2 h-4 w-4" />}
    </Button>
  );
}
