"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

const statsIconMap = {
  briefcase: Briefcase,
  building: Building2,
  users: Users,
  "file-text": FileText,
  calendar: Calendar,
  "message-square": MessageSquare,
} as const;

export type StatsIconKey = keyof typeof statsIconMap;

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: StatsIconKey;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
}: StatsCardProps) {
  const Icon = statsIconMap[icon] as LucideIcon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${trend.value > 0 ? "text-green-500" : trend.value < 0 ? "text-red-500" : "text-muted-foreground"}`}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
