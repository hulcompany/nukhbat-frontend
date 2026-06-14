import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  iconContainerClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-slate-200 shadow-xs p-5 flex flex-row justify-between items-center h-full",
        className,
      )}
    >
      <div className="flex flex-col items-start text-right">
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 leading-none">
          {value}
        </h3>
      </div>
      <div
        className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center shrink-0",
          iconContainerClassName,
        )}
      >
        <Icon className={cn("h-6 w-6", iconClassName)} />
      </div>
    </Card>
  );
}
